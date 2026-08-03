import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.conf import settings
from django.apps import apps
print("INSTALLED:", settings.INSTALLED_APPS)
print("APP LABELS:", [app.label for app in apps.get_app_configs()])
