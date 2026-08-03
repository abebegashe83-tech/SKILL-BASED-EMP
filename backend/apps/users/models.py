from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import random
import string
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

def validate_file_size(value):
    filesize = value.size
    
    if filesize > 5242880:
        raise ValidationError("The maximum file size that can be uploaded is 5MB")
    else:
        return value


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model mapped to @@map("users_user").
    AbstractBaseUser provides: password, last_login.
    PermissionsMixin provides: is_superuser, groups, user_permissions.
    """
    ROLE_CHOICES = (
        ('jobseeker', 'Job Seeker'),
        ('employer', 'Employer'),
        ('admin', 'Admin'),
    )

    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='jobseeker')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        db_table = 'users_user'
        app_label = 'users'

    def __str__(self):
        return f"{self.email} - {self.role}"


class Profile(models.Model):
    """
    Unified user profile model. @@map("users_profile").
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Basic info
    full_name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(null=True, blank=True)
    
    # Skills
    skills = models.JSONField(null=True, blank=True)
    
    # Experience
    experience = models.TextField(null=True, blank=True)
    
    # Education
    education = models.TextField(null=True, blank=True)
    
    # CV/Resume
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    
    # Contact
    phone = models.CharField(max_length=20, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    
    # Social links
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)

    class Meta:
        db_table = 'users_profile'
        app_label = 'users'

    def __str__(self):
        return f"{self.user.email} - Profile"

    def get_text_representation(self):
        try:
            from services.embedding_service import preprocess_text
        except:
            preprocess_text = lambda x: str(x).lower()
        
        try:
            skills_list = self.skills or []
            if not isinstance(skills_list, list):
                skills_list = [str(skills_list)] if skills_list else []
            
            skills_str = " ".join([preprocess_text(str(s)) for s in skills_list if s])
            weighted_skills = f"{skills_str} {skills_str} {skills_str}".strip()
            
            education = preprocess_text(str(self.education)) if self.education else ""
            experience = preprocess_text(str(self.experience)) if self.experience else ""
            
            return f"Skills: {weighted_skills}. Experience: {experience}. Education: {education}"
        except:
            return ""


class JobseekerProfile(models.Model):
    """
    One-to-one profile for job seekers. @@map("users_jobseekerprofile").
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='jobseeker_profile'
    )
    skills = models.JSONField(null=True, blank=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    education = models.TextField(null=True, blank=True)
    experience = models.TextField(null=True, blank=True)
    cv = models.FileField(
        upload_to='cvs/', 
        null=True, 
        blank=True,
        validators=[FileExtensionValidator(['pdf']), validate_file_size]
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/jobseekers/',
        null=True,
        blank=True,
        validators=[validate_file_size]
    )

    class Meta:
        db_table = 'users_jobseekerprofile'
        app_label = 'users'

    def __str__(self):
        return f"{self.user.email} - Jobseeker Profile"

    def get_text_representation(self):
        try:
            from services.embedding_service import preprocess_text
        except:
            preprocess_text = lambda x: str(x).lower()
        
        try:
            skills_list = self.skills or []
            if not isinstance(skills_list, list):
                skills_list = [str(skills_list)] if skills_list else []
            
            skills_str = " ".join([preprocess_text(str(s)) for s in skills_list if s])
            weighted_skills = f"{skills_str} {skills_str} {skills_str}".strip()
            
            education = preprocess_text(str(self.education)) if self.education else ""
            experience = preprocess_text(str(self.experience)) if self.experience else ""
            
            return f"Skills: {weighted_skills}. Experience: {experience}. Education: {education}"
        except:
            return ""


class EmployerProfile(models.Model):
    """
    One-to-one profile for employers. @@map("users_employerprofile").
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='employer_profile'
    )
    company_name = models.CharField(max_length=255, null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)
    company_size = models.CharField(max_length=50, null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/employers/',
        null=True,
        blank=True,
        validators=[validate_file_size]
    )

    class Meta:
        db_table = 'users_employerprofile'
        app_label = 'users'

    def __str__(self):
        return f"{self.user.email} - Employer Profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        try:
            Profile.objects.get_or_create(user=instance)
            if instance.role == 'jobseeker':
                JobseekerProfile.objects.get_or_create(user=instance)
            elif instance.role == 'employer':
                EmployerProfile.objects.get_or_create(user=instance)
        except Exception:
            pass


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        if hasattr(instance, 'profile'):
            instance.profile.save()
        if instance.role == 'jobseeker' and hasattr(instance, 'jobseeker_profile'):
            instance.jobseeker_profile.save()
        elif instance.role == 'employer' and hasattr(instance, 'employer_profile'):
            instance.employer_profile.save()
    except Exception:
        pass










class PasswordResetOTP(models.Model):
    """
    OTP model for password reset with 10-minute expiration.
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='reset_otps'
    )
    otp = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'users_passwordresetotp'
        app_label = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.otp}"

    @classmethod
    def generate_otp(cls, user):
        """
        Generate a 6-digit OTP for the user and delete any existing unused OTPs.
        """
        cls.objects.filter(user=user, is_used=False).delete()
        otp = ''.join(random.choices(string.digits, k=6))
        return cls.objects.create(user=user, otp=otp)

    @classmethod
    def verify_otp(cls, user, otp):
        """
        Verify if the OTP is valid for the user and not expired (10 minutes).
        """
        try:
            reset_otp = cls.objects.get(user=user, otp=otp, is_used=False)
            if reset_otp.is_expired():
                reset_otp.delete()
                return False
            return reset_otp
        except cls.DoesNotExist:
            return None

    def is_expired(self):
        """
        Check if OTP is expired (10 minutes).
        """
        expiration_time = timezone.now() - timezone.timedelta(minutes=10)
        return self.created_at < expiration_time

    def mark_as_used(self):
        """
        Mark OTP as used.
        """
        self.is_used = True
        self.save()

    @classmethod
    def cleanup_expired_otps(cls):
        """
        Delete all expired OTPs older than 10 minutes.
        """
        expiration_time = timezone.now() - timezone.timedelta(minutes=10)
        deleted_count, _ = cls.objects.filter(
            created_at__lt=expiration_time,
            is_used=False
        ).delete()
        return deleted_count
