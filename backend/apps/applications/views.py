from rest_framework import generics, status, permissions, views
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Application
from apps.jobs.models import Job
from apps.jobs.permissions import IsJobseeker, IsEmployer
from .serializers import ApplicationSerializer, ApplicationStatusUpdateSerializer, ApplicationListSerializer, EmployerCandidateSerializer
from apps.notifications.models import Notification

class ApplyJobView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsJobseeker]

    def perform_create(self, serializer):
        job_id = self.kwargs.get('job_id')
        job = get_object_or_404(Job, id=job_id)
        
        print(f"[APPLY] User {self.request.user.email} applying for job {job_id} ({job.title})")
        print(f"[APPLY] Job created_by: {job.created_by.email if job.created_by else 'None'}")
        
        if Application.objects.filter(user=self.request.user, job=job).exists():
            print(f"[APPLY] User already applied for this job")
            raise ValidationError("You have already applied for this job.")
            
        application = serializer.save(user=self.request.user, job=job)
        
        # Attach CV
        if hasattr(self.request.user, 'jobseeker_profile') and self.request.user.jobseeker_profile.cv:
            application.cv = self.request.user.jobseeker_profile.cv
            application.save()
            
        print(f"[APPLY] Application created successfully")
        
        # Create notification for employer
        try:
            Notification.objects.create(
                user=job.created_by,
                title="New Job Application",
                message=f"{self.request.user.email} applied to your job: {job.title}",
                type="application"
            )
            print(f"[APPLY] Notification created for employer {job.created_by.email}")
        except Exception as e:
            print(f"[APPLY] ERROR creating notification: {e}")
            # Don't fail the application if notification fails

class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'role') and self.request.user.role.lower() != 'jobseeker':
            raise PermissionDenied("Only jobseekers can view their applications.")
        return Application.objects.filter(user=self.request.user).order_by('-applied_at')


class EmployerCandidatesView(generics.ListAPIView):
    """Return all applicants across all jobs owned by the logged-in employer."""
    serializer_class = EmployerCandidateSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def get_queryset(self):
        print(f"[DEBUG] EmployerCandidatesView access by {self.request.user.email} (Role: {getattr(self.request.user, 'role', 'unknown')})")
        employer_jobs = Job.objects.filter(created_by=self.request.user)
        print(f"[DEBUG] Employer has {employer_jobs.count()} jobs.")
        return (
            Application.objects
            .filter(job__in=employer_jobs)
            .select_related('user', 'job')
            .prefetch_related('user__jobseeker_profile')
            .order_by('-applied_at')
        )

class UpdateApplicationStatusView(generics.UpdateAPIView):
    """Update the status of an application. Only the job owner can perform this."""
    queryset = Application.objects.all()
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def perform_update(self, serializer):
        application = self.get_object()
        if application.job.created_by != self.request.user:
            raise PermissionDenied("You do not have permission to update applications for this job.")
        
        new_status = self.request.data.get('status')
        if new_status not in dict(Application.STATUS_CHOICES):
            raise ValidationError(f"Invalid status. Choose from: {list(dict(Application.STATUS_CHOICES).keys())}")
        
        old_status = application.status
        serializer.save()
        
        # Create notification for jobseeker if status changed
        if old_status != new_status:
            status_messages = {
                'pending': 'Your application is pending review.',
                'shortlisted': 'Congratulations! Your application has been shortlisted for further review.',
                'interview': f'You have been scheduled for an interview for {application.job.title}.',
                'accepted': 'Congratulations! Your application has been accepted.',
                'rejected': 'Your application has been rejected.',
            }
            
            message = status_messages.get(new_status, f'Your application status has been updated to {new_status}.')
            
            Notification.objects.create(
                user=application.user,
                title=f"Application Updated: {application.job.title}",
                message=message,
                type="application"
            )


class AcceptApplicationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def post(self, request, pk):
        application = get_object_or_404(Application, id=pk)
        job = application.job

        if job.created_by != request.user:
            return Response({"error": "You do not have permission to accept applications for this job."}, status=status.HTTP_403_FORBIDDEN)

        if job.filled_positions >= job.positions:
            return Response({"error": "All positions already filled"}, status=status.HTTP_400_BAD_REQUEST)

        application.status = "accepted"
        application.save()

        job.filled_positions += 1

        if job.filled_positions < job.positions:
            job.status = "open"
        elif job.filled_positions == job.positions:
            job.status = "filled"
            Application.objects.filter(job=job, status="pending").update(status="rejected")

        job.save()

        Notification.objects.create(
            user=application.user,
            title="Application Accepted",
            message=f"Congratulations! Your application for {job.title} has been accepted.",
            type="application"
        )

        return Response({
            "message": "Candidate accepted",
            "job_status": job.status,
            "filled": job.filled_positions
        })


class CloseJobView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def post(self, request, pk):
        job = get_object_or_404(Job, id=pk, created_by=request.user)

        job.status = "closed"
        job.save()

        return Response({"message": "Job closed manually"})

