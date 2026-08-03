from django.db import models
from django.conf import settings
from apps.jobs.models import Job


class Application(models.Model):
    """
    Job application model. @@map("applications_application").
    @@unique([userId, jobId]) → unique_together = ('user', 'job').
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('shortlisted', 'Shortlisted'),
        ('interview', 'Interview'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    cv = models.FileField(upload_to='applications/cv/', null=True, blank=True)
    interview_date = models.DateField(null=True, blank=True)
    interview_time = models.TimeField(null=True, blank=True)
    interview_link = models.URLField(null=True, blank=True)
    interview_notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'applications_application'
        unique_together = ('user', 'job')
        app_label = 'applications'

    def __str__(self):
        return f"{self.user.email} -> {self.job.title} [{self.status}]"
