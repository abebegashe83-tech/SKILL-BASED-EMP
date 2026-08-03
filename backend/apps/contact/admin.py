from django.contrib import admin
from .models import ContactMessage, LandingContent

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('created_at',)
    list_editable = ('is_read',)
    
    fieldsets = (
        ('Message Details', {
            'fields': ('name', 'email', 'message')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(LandingContent)
class LandingContentAdmin(admin.ModelAdmin):
    list_display = ('section', 'title', 'created_at', 'updated_at')
    list_filter = ('section', 'created_at')
    search_fields = ('title', 'subtitle', 'section')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Content', {
            'fields': ('section', 'title', 'subtitle', 'image')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
