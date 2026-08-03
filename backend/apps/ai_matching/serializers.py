from rest_framework import serializers
from apps.jobs.serializers import JobSerializer

class JobRecommendationSerializer(serializers.Serializer):
    job = JobSerializer()
    similarity_score = serializers.FloatField()
    skill_score = serializers.IntegerField(required=False)
    related_score = serializers.IntegerField(required=False)
    experience_score = serializers.IntegerField(required=False)
    source = serializers.CharField(required=False)
    direct_matches = serializers.ListField(required=False)
    related_matches = serializers.ListField(required=False)
    reason = serializers.CharField(required=False)
    exact_match = serializers.BooleanField(required=False)
    embedding = serializers.IntegerField(required=False)
    overlap = serializers.IntegerField(required=False)
    related = serializers.IntegerField(required=False)
