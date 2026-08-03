from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('created_at',)
    list_per_page = 20
    ordering = ('-created_at',)
    list_editable = ('is_read',)
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'type', 'title', 'message')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
