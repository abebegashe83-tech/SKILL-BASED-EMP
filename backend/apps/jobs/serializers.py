from rest_framework import serializers
from .models import Job
from apps.applications.models import Application

class JobSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.email')
    skill_description = serializers.CharField(
        write_only=True, 
        required=False, 
        allow_blank=True,
        help_text="Natural language description of skills (e.g., 'I want backend developer with Python and Django experience')"
    )

    class Meta:
        model = Job
        fields = (
            'id', 'title', 'description', 'required_skills', 'salary', 
            'location', 'experience_level', 'positions', 'filled_positions', 
            'status', 'created_by', 'created_at', 'updated_at', 'is_active', 
            'skill_description'
        )
        read_only_fields = ('created_by', 'created_at', 'updated_at')
        extra_kwargs = {
            'title': {
                'required': True,
                'error_messages': {'required': 'Job title is required.'}
            },
            'description': {
                'required': True,
                'error_messages': {'required': 'Job description is required.'}
            },
            'required_skills': {
                'required': False,
                'error_messages': {'invalid': 'Skills must be a valid list.'}
            },
            'location': {
                'required': False,
                'error_messages': {'invalid': 'Location must be a valid string.'}
            },
            'salary': {
                'required': False,
                'error_messages': {'invalid': 'Salary must be a valid string.'}
            },
            'experience_level': {
                'required': False,
                'error_messages': {'invalid': 'Experience level must be a valid string.'}
            }
        }

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Job title cannot be empty.')
        if len(value) < 3:
            raise serializers.ValidationError('Job title must be at least 3 characters long.')
        return value.strip()

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Job description cannot be empty.')
        if len(value) < 10:
            raise serializers.ValidationError('Job description must be at least 10 characters long.')
        return value.strip()

    def validate_required_skills(self, value):
        if value and not isinstance(value, list):
            raise serializers.ValidationError('Skills must be a list of strings.')
        return value

    def create(self, validated_data):
        skill_description = validated_data.pop('skill_description', None)
        required_skills = validated_data.get('required_skills', [])
        
        # Extract skills from natural language description
        if skill_description:
            try:
                from services.skill_extraction_service import enhance_job_skills
                enhanced_skills = enhance_job_skills(skill_description, required_skills)
                validated_data['required_skills'] = enhanced_skills
            except Exception as e:
                print(f"Error extracting skills from description: {e}")
                # Fall back to original skills if extraction fails
                validated_data['required_skills'] = required_skills
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        skill_description = validated_data.pop('skill_description', None)
        required_skills = validated_data.get('required_skills', instance.required_skills)
        
        # Extract skills from natural language description
        if skill_description:
            try:
                from services.skill_extraction_service import enhance_job_skills
                enhanced_skills = enhance_job_skills(skill_description, required_skills)
                validated_data['required_skills'] = enhanced_skills
            except Exception as e:
                print(f"Error extracting skills from description: {e}")
                # Fall back to original skills if extraction fails
                validated_data['required_skills'] = required_skills
        
        return super().update(instance, validated_data)

class ApplicantListSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = Application
        fields = ('id', 'user', 'user_email', 'status', 'applied_at')
