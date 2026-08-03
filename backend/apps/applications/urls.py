from django.urls import path
from .views import ApplyJobView, MyApplicationsView, EmployerCandidatesView, UpdateApplicationStatusView, AcceptApplicationView, CloseJobView

urlpatterns = [
    path('', MyApplicationsView.as_view(), name='applications'),
    path('apply/<int:job_id>/', ApplyJobView.as_view(), name='apply-job'),
    path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),
    path('employer/candidates/', EmployerCandidatesView.as_view(), name='employer-candidates'),
    path('<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-application-status'),
    path('<int:pk>/accept/', AcceptApplicationView.as_view(), name='accept-application'),
    path('jobs/<int:pk>/close/', CloseJobView.as_view(), name='close-job'),
]
