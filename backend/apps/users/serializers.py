from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .models import JobseekerProfile, EmployerProfile, PasswordResetOTP, Profile

User = get_user_model()

class JobseekerProfileSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = JobseekerProfile
        fields = ('skills', 'education', 'experience', 'profile_picture', 'profile_picture_url')

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

class EmployerProfileSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = EmployerProfile
        fields = ('company_name', 'industry', 'company_size', 'profile_picture', 'profile_picture_url')

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('id',)

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    jobseeker_profile = serializers.SerializerMethodField()
    employer_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'profile', 'jobseeker_profile', 'employer_profile')

    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            return ProfileSerializer(obj.profile).data
        return None

    def get_jobseeker_profile(self, obj):
        if hasattr(obj, 'jobseeker_profile'):
            return JobseekerProfileSerializer(obj.jobseeker_profile, context=self.context).data
        return None

    def get_employer_profile(self, obj):
        if hasattr(obj, 'employer_profile'):
            return EmployerProfileSerializer(obj.employer_profile, context=self.context).data
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8, 
                                     error_messages={'min_length': 'Password must be at least 8 characters long.'})
    
    class Meta:
        model = User
        fields = ('email', 'password', 'role')
        extra_kwargs = {
            'email': {
                'error_messages': {
                    'required': 'Email is required.',
                    'invalid': 'Please enter a valid email address.',
                    'unique': 'A user with this email already exists.'
                }
            },
            'role': {
                'error_messages': {
                    'required': 'Role is required.',
                    'invalid_choice': 'Invalid role selected. Must be jobseeker, employer, or admin.'
                }
            }
        }
    
    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email
    
    def validate_role(self, value):
        valid_roles = ['jobseeker', 'employer', 'admin']
        if value not in valid_roles:
            raise serializers.ValidationError(f'Invalid role. Must be one of: {", ".join(valid_roles)}.')
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')
        return value
    
    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                email=validated_data['email'].lower(),
                password=validated_data['password'],
                role=validated_data.get('role', 'jobseeker')
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(f'Registration failed: {str(e)}')

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={'required': 'Email is required.', 'invalid': 'Please enter a valid email address.'})
    password = serializers.CharField(required=True, write_only=True, error_messages={'required': 'Password is required.'})

    def validate_email(self, value):
        email = value.lower()
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError('No account found with this email address.')
        return email

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')

        user = User.objects.filter(email=email.lower()).first()
        if not user:
            raise AuthenticationFailed('No account found with this email address.')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Invalid email or password.')

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }

class ProfileUpdateSerializer(serializers.Serializer):
    skills = serializers.JSONField(required=False, allow_null=True)
    education = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    company_name = serializers.CharField(required=False, allow_blank=True, max_length=255)
    industry = serializers.CharField(required=False, allow_blank=True, max_length=255)
    company_size = serializers.CharField(required=False, allow_blank=True, max_length=50)
    title = serializers.CharField(required=False, allow_blank=True, max_length=255)
    location = serializers.CharField(required=False, allow_blank=True, max_length=255)
    bio = serializers.CharField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    linkedin = serializers.URLField(required=False, allow_blank=True)
    github = serializers.URLField(required=False, allow_blank=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    def to_representation(self, instance):
        return UserSerializer(instance).data

    def update(self, instance, validated_data):
        try:
            print(f"[PROFILE UPDATE] User: {instance.email}, Role: {instance.role}", flush=True)
            print(f"[PROFILE UPDATE] Validated data: {validated_data}", flush=True)
            
            # Update generic Profile
            generic_profile, created = Profile.objects.get_or_create(user=instance)
            print(f"[PROFILE UPDATE] Generic profile created: {created}", flush=True)
            
            if 'full_name' in validated_data:
                generic_profile.full_name = validated_data.get('full_name', generic_profile.full_name)
            if 'location' in validated_data:
                generic_profile.location = validated_data.get('location', generic_profile.location)
            if 'bio' in validated_data:
                generic_profile.bio = validated_data.get('bio', generic_profile.bio)
            if 'phone' in validated_data:
                generic_profile.phone = validated_data.get('phone', generic_profile.phone)
                print(f"[PROFILE UPDATE] Phone set to: {generic_profile.phone}", flush=True)
            if 'linkedin' in validated_data:
                generic_profile.linkedin = validated_data.get('linkedin', generic_profile.linkedin)
            if 'github' in validated_data:
                generic_profile.github = validated_data.get('github', generic_profile.github)
            if 'education' in validated_data:
                generic_profile.education = validated_data.get('education', generic_profile.education)
            if 'experience' in validated_data:
                generic_profile.experience = validated_data.get('experience', generic_profile.experience)
            if 'skills' in validated_data:
                generic_profile.skills = validated_data.get('skills', generic_profile.skills)
            generic_profile.save()
            print(f"[PROFILE UPDATE] Generic profile saved", flush=True)

            # Update role-specific profile
            if instance.role == 'jobseeker':
                profile, created = JobseekerProfile.objects.get_or_create(user=instance)
                if 'skills' in validated_data:
                    profile.skills = validated_data.get('skills', profile.skills)
                if 'education' in validated_data:
                    profile.education = validated_data.get('education', profile.education)
                if 'experience' in validated_data:
                    profile.experience = validated_data.get('experience', profile.experience)
                if 'title' in validated_data:
                    profile.title = validated_data.get('title', profile.title)
                if 'location' in validated_data:
                    profile.location = validated_data.get('location', profile.location)
                if 'bio' in validated_data:
                    profile.bio = validated_data.get('bio', profile.bio)
                if 'profile_picture' in validated_data:
                    profile.profile_picture = validated_data.get('profile_picture', profile.profile_picture)
                profile.save()
            elif instance.role == 'employer':
                profile, created = EmployerProfile.objects.get_or_create(user=instance)
                if 'company_name' in validated_data:
                    profile.company_name = validated_data.get('company_name', profile.company_name)
                if 'industry' in validated_data:
                    profile.industry = validated_data.get('industry', profile.industry)
                if 'company_size' in validated_data:
                    profile.company_size = validated_data.get('company_size', profile.company_size)
                if 'website' in validated_data:
                    profile.website = validated_data.get('website', profile.website)
                if 'profile_picture' in validated_data:
                    profile.profile_picture = validated_data.get('profile_picture', profile.profile_picture)
                profile.save()
            return instance
        except Exception as e:
            print(f"[PROFILE UPDATE] Error: {str(e)}", flush=True)
            import traceback
            print(traceback.format_exc(), flush=True)
            raise serializers.ValidationError(f'Profile update failed: {str(e)}')


class GenerateOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={'required': 'Email is required.', 'invalid': 'Please enter a valid email address.'})

    def validate_email(self, value):
        email = value.lower()
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError('No account found with this email address.')
        return email


class VerifyOTPResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, error_messages={'required': 'Email is required.', 'invalid': 'Please enter a valid email address.'})
    otp = serializers.CharField(required=True, min_length=6, max_length=6, error_messages={'required': 'OTP is required.', 'min_length': 'OTP must be 6 digits.', 'max_length': 'OTP must be 6 digits.'})
    new_password = serializers.CharField(required=True, min_length=8, error_messages={'required': 'New password is required.', 'min_length': 'Password must be at least 8 characters long.'})

    def validate_email(self, value):
        email = value.lower()
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError('No account found with this email address.')
        return email

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')
        return value

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')
        user = User.objects.get(email=email)
        
        reset_otp = PasswordResetOTP.verify_otp(user, otp)
        if reset_otp is None or reset_otp is False:
            raise serializers.ValidationError('Invalid or expired OTP.')
        
        attrs['user'] = user
        attrs['reset_otp'] = reset_otp
        return attrs
