from django.contrib import admin
from django.urls import path, include
from apps.users.views import api_root

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    
    # User Authentication & Profiles
    path('api/', include('apps.users.urls')),
    
    # Core Modules
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/applications/', include('apps.applications.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    
    # Contact
    path('api/contact/', include('apps.contact.urls')),
    
    # Intelligence & Admin Panels
    path('api/ai-matching/', include('apps.ai_matching.urls')),
    path('api/admin/', include('apps.admin_api.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
