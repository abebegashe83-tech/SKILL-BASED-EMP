from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Job
from .serializers import JobSerializer, ApplicantListSerializer
from .permissions import IsEmployer, IsEmployerOwnerOrReadOnly
from apps.applications.models import Application

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(status='open').order_by('-created_at')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsEmployerOwnerOrReadOnly]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsEmployer()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Job.DoesNotExist:
            print(f"[DEBUG] Job lookup failed for ID: {kwargs.get('pk')}")
            return Response(
                {'detail': 'Job not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

class EmployerJobsView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user).order_by('-created_at')

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        if getattr(request.user, 'role', '').lower() != 'employer':
            error_msg = 'Employer access required. Your role is: {}'.format(getattr(request.user, 'role', 'unknown'))
            print(f"[PERMISSION DENIED] User {request.user.email} (role: {getattr(request.user, 'role', 'unknown')}) access restricted for EmployerJobsView")
            return Response({'detail': error_msg}, status=status.HTTP_403_FORBIDDEN)
        return super().get(request, *args, **kwargs)

class JobApplicantsView(generics.ListAPIView):
    serializer_class = ApplicantListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'role') and self.request.user.role.lower() != 'employer':
            raise PermissionDenied("Only employers can view applicants.")
            
        job_id = self.kwargs.get('id')
        job = get_object_or_404(Job, id=job_id)
        
        if job.created_by != self.request.user:
            raise PermissionDenied("You can only view applicants for your own jobs.")
            
        return Application.objects.filter(job=job).order_by('-applied_at')
