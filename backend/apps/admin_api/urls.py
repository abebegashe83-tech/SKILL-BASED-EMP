from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminUserViewSet, AdminJobViewSet

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'jobs', AdminJobViewSet, basename='admin-jobs')

urlpatterns = [
    path('', include(router.urls)),
]
