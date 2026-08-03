from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.jobs.models import Job

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'is_active', 'date_joined')
        read_only_fields = ('id', 'email', 'date_joined')

class AdminJobSerializer(serializers.ModelSerializer):
    created_by_email = serializers.ReadOnlyField(source='created_by.email')

    class Meta:
        model = Job
        fields = ('id', 'title', 'description', 'salary', 'location', 'created_by_email', 'created_at', 'is_active')
