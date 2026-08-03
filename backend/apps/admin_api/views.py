from rest_framework import viewsets, mixins
from django.contrib.auth import get_user_model
from apps.jobs.models import Job
from .serializers import AdminUserSerializer, AdminJobSerializer
from .permissions import IsAdminRole

User = get_user_model()

class AdminUserViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]

class AdminJobViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = AdminJobSerializer
    permission_classes = [IsAdminRole]
