from django.db import models
from django.conf import settings


class Job(models.Model):
    """
    Job posting model. @@map("jobs_job").
    updated_at uses auto_now=True to mirror Prisma's @updatedAt.
    """
    EXPERIENCE_CHOICES = (
        ('ENTRY', 'Entry Level'),
        ('MID', 'Mid Level'),
        ('SENIOR', 'Senior Level'),
        ('EXECUTIVE', 'Executive'),
    )

    STATUS_CHOICES = (
        ('open', 'Open'),
        ('filled', 'Filled'),
        ('closed', 'Closed'),
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs_created'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(null=True, blank=True)
    salary = models.CharField(max_length=100, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    experience_level = models.CharField(
        max_length=20,
        choices=EXPERIENCE_CHOICES,
        default='MID'
    )
    positions = models.IntegerField(default=1)
    filled_positions = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # mirrors @updatedAt

    class Meta:
        db_table = 'jobs_job'
        app_label = 'jobs'

    def __str__(self):
        return f"{self.title} - {self.created_by.email}"

    def get_text_representation(self):
        try:
            from services.embedding_service import preprocess_text
        except:
            preprocess_text = lambda x: str(x).lower()
        
        try:
            title = preprocess_text(str(self.title) if self.title else "")
            description = preprocess_text(str(self.description) if self.description else "")
            
            skills_data = self.required_skills or []
            if not isinstance(skills_data, list):
                skills_data = [str(skills_data)] if skills_data else []
                
            skills_str = " ".join([preprocess_text(str(s)) for s in skills_data if s])
            weighted_skills = f"{skills_str} {skills_str} {skills_str}".strip()
            
            return f"Job Title: {title}. Required Skills: {weighted_skills}. Description: {description}"
        except:
            return ""
