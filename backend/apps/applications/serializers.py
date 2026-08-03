from rest_framework import serializers
from .models import Application
from apps.jobs.serializers import JobSerializer
from services.recommendation_service import calculate_match_score

class ApplicationSerializer(serializers.ModelSerializer):
    cv = serializers.FileField(read_only=True)

    class Meta:
        model = Application
        fields = ('id', 'user', 'job', 'status', 'applied_at', 'cv')
        read_only_fields = ('user', 'job', 'applied_at', 'cv')

    def validate(self, attrs):
        user = self.context.get('request').user
        job = attrs.get('job')
        
        if user and job:
            if Application.objects.filter(user=user, job=job).exists():
                raise serializers.ValidationError('You have already applied for this job.')
        
        return attrs

class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer specifically for updating application status and interview details."""
    class Meta:
        model = Application
        fields = ('status', 'interview_date', 'interview_time', 'interview_link', 'interview_notes')

class ApplicationListSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    
    cv = serializers.FileField(read_only=True)

    class Meta:
        model = Application
        fields = ('id', 'user', 'job', 'status', 'applied_at', 'cv', 'interview_date', 'interview_time', 'interview_link', 'interview_notes')

class EmployerCandidateSerializer(serializers.ModelSerializer):
    """Flat representation of an application for the employer candidates view."""
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='job.title', read_only=True)
    applied_at = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%SZ', read_only=True)
    cv_url = serializers.SerializerMethodField()
    interview_date = serializers.DateField(read_only=True)
    interview_time = serializers.TimeField(read_only=True)
    interview_link = serializers.URLField(read_only=True)
    interview_notes = serializers.CharField(read_only=True)

    class Meta:
        model = Application
        fields = ('id', 'name', 'email', 'skills', 'match_score', 'job_title', 'status', 'applied_at', 'cv_url', 'interview_date', 'interview_time', 'interview_link', 'interview_notes')

    def get_name(self, obj):
        user = obj.user
        return getattr(user, 'full_name', None) or user.email.split('@')[0]

    def get_email(self, obj):
        return obj.user.email

    def get_skills(self, obj):
        user = obj.user
        if hasattr(user, 'jobseeker_profile') and user.jobseeker_profile.skills:
            return user.jobseeker_profile.skills
        if hasattr(user, 'profile') and user.profile.skills:
            return user.profile.skills
        return []

    def get_match_score(self, obj):
        user = obj.user
        job = obj.job
        profile = getattr(user, 'jobseeker_profile', None)
        if not profile:
            return 0
        try:
            result = calculate_match_score(job, profile)
            # calculate_match_score returns a dict with 'score'
            if isinstance(result, dict):
                return result.get('score', result.get('final_score', 0))
            return int(result)
        except Exception:
            return 0

    def get_cv_url(self, obj):
        request = self.context.get('request')
        # Prefer the CV on the application itself; fall back to the profile CV
        cv_file = obj.cv or getattr(getattr(obj.user, 'jobseeker_profile', None), 'cv', None)
        if not cv_file:
            return None
        if request:
            return request.build_absolute_uri(cv_file.url)
        return cv_file.url

