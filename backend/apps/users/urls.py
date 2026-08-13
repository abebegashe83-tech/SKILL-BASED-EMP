from django.urls import path
from .views import RegisterView, LoginView, ProfileView, GenerateOTPView, VerifyOTPResetView, UserProfileView, AuthUserView, JobseekerSkillInsightView, UploadCVView, SkillSuggestionsView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user/', AuthUserView.as_view(), name='auth-user'),
    path('auth/generate-otp/', GenerateOTPView.as_view(), name='generate-otp'),
    path('auth/verify-otp-reset/', VerifyOTPResetView.as_view(), name='verify-otp-reset'),
    path('upload-cv/', UploadCVView.as_view(), name='upload-cv'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/new/', UserProfileView.as_view(), name='user-profile'),
    path('profile/skill-insights/', JobseekerSkillInsightView.as_view(), name='skill-insights'),
    path('skills/suggestions/', SkillSuggestionsView.as_view(), name='skill-suggestions'),
]
