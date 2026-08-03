from django.db import models
from django.conf import settings
from apps.jobs.models import Job


class MatchResult(models.Model):
    """
    AI match result between a user and a job. @@map("ai_matching_matchresult").
    @@unique([userId, jobId]) → unique_together = ('user', 'job').
    insights is nullable Json? → JSONField(null=True, blank=True).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matches'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='matches'
    )
    score = models.FloatField()
    insights = models.JSONField(null=True, blank=True)
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_matching_matchresult'
        unique_together = ('user', 'job')
        app_label = 'ai_matching'

    def __str__(self):
        return f"Match: {self.user.email} - {self.job.title} ({self.score})"
