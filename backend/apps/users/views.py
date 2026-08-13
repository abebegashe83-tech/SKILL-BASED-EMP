import sys
import logging
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .serializers import RegisterSerializer, LoginSerializer, ProfileUpdateSerializer, UserSerializer, GenerateOTPSerializer, VerifyOTPResetSerializer, ProfileSerializer
from .models import PasswordResetOTP, Profile, JobseekerProfile
from apps.jobs.models import Job
from services.sms_service import sms_service

User = get_user_model()
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "message": "Welcome to SkillMatch API",
        "endpoints": {
            "auth": "/api/auth/",
            "profile": "/api/profile/",
            "jobs": "/api/jobs/",
            "applications": "/api/applications/",
            "ai": "/api/ai/",
            "admin": "/api/admin/"
        }
    })

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': 'Registration failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': 'Login failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            serializer = UserSerializer(request.user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Failed to fetch profile.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UserSerializer(request.user, context={'request': request}).data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': 'Profile update failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile


class UploadCVView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("cv")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        if not file.name.lower().endswith(".pdf"):
            return Response({"error": "Only PDF allowed"}, status=400)

        # 5MB limit
        if file.size > 5 * 1024 * 1024:
            return Response({"error": "The maximum file size that can be uploaded is 5MB"}, status=400)

        if hasattr(request.user, 'jobseeker_profile'):
            profile = request.user.jobseeker_profile
            profile.cv = file
            profile.save()
            return Response({
                "message": "CV uploaded successfully",
                "cv_url": profile.cv.url if profile.cv else None
            })
        else:
            return Response({"error": "Only jobseekers can upload CVs"}, status=403)


class AuthUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class GenerateOTPView(generics.GenericAPIView):
    serializer_class = GenerateOTPSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        print("[GENERATE OTP] ===== REQUEST RECEIVED =====", flush=True)
        print(f"[GENERATE OTP] Request data: {request.data}", flush=True)

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            email = serializer.validated_data['email']
            print(f"[GENERATE OTP] Email validated: {email}", flush=True)

            user = User.objects.filter(email=email).first()
            if not user:
                print(f"[GENERATE OTP] User NOT found for email: {email}", flush=True)
                return Response({
                    'success': False,
                    'message': 'No account found with this email address.'
                }, status=status.HTTP_404_NOT_FOUND)

            print(f"[GENERATE OTP] User found: {user.email} (ID: {user.id})", flush=True)

            # Cleanup expired OTPs before generating new one
            try:
                PasswordResetOTP.cleanup_expired_otps()
            except Exception as cleanup_err:
                print(f"[GENERATE OTP] Cleanup error (non-critical): {str(cleanup_err)}", flush=True)

            # Generate and save OTP
            try:
                reset_otp = PasswordResetOTP.generate_otp(user)
                print(f"[GENERATE OTP] OTP generated: {reset_otp.otp}", flush=True)
            except Exception as otp_err:
                print(f"[GENERATE OTP] OTP generation error: {str(otp_err)}", flush=True)
                import traceback
                print(traceback.format_exc(), flush=True)
                return Response({
                    'success': False,
                    'message': 'Failed to generate OTP. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Send OTP via email
            subject = 'Password Reset OTP'
            body = (
                f"Hello,\n\n"
                f"Your password reset OTP is: {reset_otp.otp}\n\n"
                f"This OTP will expire in 10 minutes.\n\n"
                f"If you did not request this change, you can safely ignore this email.\n\n"
                f"Thanks,\n"
                f"The SkillMatch Team"
            )

            print(f"[GENERATE OTP] Sending email to: {email}", flush=True)
            print(f"[GENERATE OTP] Email subject: {subject}", flush=True)
            print(f"[GENERATE OTP] Email body:\n{body}", flush=True)

            email_sent = False
            try:
                sent_count = send_mail(
                    subject=subject,
                    message=body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                print(f"[GENERATE OTP] send_mail sent_count: {sent_count}", flush=True)
                email_sent = sent_count > 0
            except Exception as email_err:
                print(f"[GENERATE OTP] Email sending error: {str(email_err)}", flush=True)

            # Send OTP via SMS if user has phone number
            sms_sent = False
            try:
                # Get user's phone number from profile
                if hasattr(user, 'profile') and user.profile.phone:
                    phone_number = user.profile.phone
                    sms_message = f"Your SkillMatch password reset OTP is: {reset_otp.otp}. Valid for 10 minutes."
                    sms_sent = sms_service.send_sms(phone_number, sms_message)
                    print(f"[GENERATE OTP] SMS sent to {phone_number}: {sms_sent}", flush=True)
                else:
                    print(f"[GENERATE OTP] No phone number found for user", flush=True)
            except Exception as sms_err:
                print(f"[GENERATE OTP] SMS sending error: {str(sms_err)}", flush=True)

            # Determine response message based on what was sent
            if email_sent and sms_sent:
                message = 'OTP sent successfully to your email and phone.'
            elif email_sent:
                message = 'OTP sent successfully to your email.'
            elif sms_sent:
                message = 'OTP sent successfully to your phone.'
            else:
                message = 'OTP generated. Delivery may be delayed, please check your spam folder.'

            print("[GENERATE OTP] ===== SUCCESS =====", flush=True)
            return Response({
                'success': True,
                'message': message,
                'email_sent': email_sent,
                'sms_sent': sms_sent
            }, status=status.HTTP_200_OK)

        except ValidationError as val_err:
            print(f"[GENERATE OTP] VALIDATION ERROR: {str(val_err)}", flush=True)
            return Response({
                'success': False,
                'message': str(val_err.detail if hasattr(val_err, 'detail') else val_err)
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            import traceback
            print(f"[GENERATE OTP] UNEXPECTED ERROR: {type(exc).__name__}: {str(exc)}", flush=True)
            print(traceback.format_exc(), flush=True)
            return Response({
                'success': False,
                'message': 'An unexpected error occurred. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPResetView(generics.GenericAPIView):
    serializer_class = VerifyOTPResetSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        print("[VERIFY OTP RESET] ===== REQUEST RECEIVED =====", flush=True)
        print(f"[VERIFY OTP RESET] Request data: {request.data}", flush=True)

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            new_password = serializer.validated_data['new_password']
            reset_otp = serializer.validated_data['reset_otp']
            
            print(f"[VERIFY OTP RESET] User found: {user.email}", flush=True)
            print(f"[VERIFY OTP RESET] OTP verified: {reset_otp.otp}", flush=True)

            # Reset user password
            user.set_password(new_password)
            user.save()
            print(f"[VERIFY OTP RESET] Password reset successful for user: {user.email}", flush=True)

            # Delete OTP after successful reset
            reset_otp.delete()
            print(f"[VERIFY OTP RESET] OTP deleted", flush=True)

            print("[VERIFY OTP RESET] ===== SUCCESS =====", flush=True)
            return Response({
                'success': True,
                'message': 'Password reset successful.'
            }, status=status.HTTP_200_OK)

        except ValidationError as e:
            print(f"[VERIFY OTP RESET] Validation error: {str(e)}", flush=True)
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"[VERIFY OTP RESET] Unexpected error: {str(e)}", flush=True)
            import traceback
            print(traceback.format_exc(), flush=True)
            return Response({
                'success': False,
                'message': 'Failed to reset password. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class SkillSuggestionsView(APIView):
    """
    Provides skill suggestions based on partial input using the SKILL_MAP.
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        from services.recommendation_service import SKILL_MAP
        
        query = request.query_params.get('q', '').lower().strip()
        
        if not query or len(query) < 2:
            return Response({"suggestions": []}, status=status.HTTP_200_OK)
        
        # Get all skills from SKILL_MAP
        all_skills = set(SKILL_MAP.keys())
        
        # Add related skills to the pool
        for related_skills in SKILL_MAP.values():
            all_skills.update(related_skills)
        
        # Filter skills that start with or contain the query
        suggestions = [
            skill.capitalize() for skill in all_skills
            if query in skill.lower()
        ]
        
        # Sort by relevance (exact match first, then starts with, then contains)
        suggestions.sort(key=lambda x: (
            0 if x.lower() == query else 1 if x.lower().startswith(query) else 2,
            len(x),
            x.lower()
        ))
        
        # Limit to 15 suggestions
        suggestions = suggestions[:15]
        
        return Response({"suggestions": suggestions}, status=status.HTTP_200_OK)


class JobseekerSkillInsightView(APIView):
    """
    Analyzes user skills against market demand (active jobs) to provide insights.
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if request.user.role != 'jobseeker':
            return Response({"error": "Only jobseekers can receive skill insights."}, status=status.HTTP_403_FORBIDDEN)

        try:
            profile = request.user.jobseeker_profile
        except JobseekerProfile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        user_skills = profile.skills or []
        if isinstance(user_skills, str):
            user_skills = [s.strip().lower() for s in user_skills.split(',') if s.strip()]
        else:
            user_skills = [str(s).lower() for s in user_skills]

        active_jobs = Job.objects.filter(is_active=True)
        job_count = active_jobs.count()

        if not user_skills:
            return Response({
                "top_skills": [],
                "demand_count": 0,
                "suggested_skill": "Python or JavaScript",
                "improvement_pct": 15,
                "message": "Add your first skills to see market insights!"
            })

        # Count demand for each user skill
        skill_demand = {skill: 0 for skill in user_skills}
        for job in active_jobs:
            job_skills = [s.lower() for s in (job.required_skills or [])]
            for skill in user_skills:
                if skill in job_skills:
                    skill_demand[skill] += 1

        # Sort by demand
        sorted_skills = sorted(skill_demand.items(), key=lambda x: x[1], reverse=True)
        top_skills_list = [s[0].capitalize() for s in sorted_skills[:2]]
        max_demand_count = sorted_skills[0][1] if sorted_skills else 0

        # Suggest a skill the user DOESN'T have
        # Logic: Find skills in active jobs that user doesn't have
        all_job_skills = []
        for job in active_jobs:
            if job.required_skills:
                all_job_skills.extend([s.lower() for s in job.required_skills])
        
        # Filter out user's existing skills
        missing_skills = [s for s in all_job_skills if s not in user_skills]
        
        from collections import Counter
        counts = Counter(missing_skills)
        most_common_missing = counts.most_common(1)
        
        suggested = most_common_missing[0][0].capitalize() if most_common_missing else "Cloud Computing"
        
        return Response({
            "top_skills": top_skills_list,
            "demand_count": max_demand_count,
            "suggested_skill": suggested,
            "improvement_pct": 12, # Static heuristic for now
        })
