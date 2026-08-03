from django.db import models

class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.email}'


class LandingContent(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.TextField()
    image = models.ImageField(upload_to="landing/", null=True, blank=True)
    section = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['section', 'id']

    def __str__(self):
        return f'{self.section} - {self.title}'
