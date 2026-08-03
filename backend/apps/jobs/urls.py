from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, EmployerJobsView, JobApplicantsView
from apps.applications.views import ApplyJobView

router = DefaultRouter()
router.register(r'', JobViewSet, basename='job')

urlpatterns = [
    path('employer/jobs/', EmployerJobsView.as_view(), name='employer-jobs'),
    path('<int:id>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),
    path('<int:job_id>/apply/', ApplyJobView.as_view(), name='job-apply'),
    path('', include(router.urls)),
]
