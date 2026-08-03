from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'location', 'salary', 'experience_level', 'is_active', 'created_at')
    list_filter = ('is_active', 'experience_level', 'location')
    search_fields = ('title', 'description', 'location', 'created_by__email')
    list_editable = ('is_active',)
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    list_per_page = 20
    ordering = ('-created_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')
    
    fieldsets = (
        ('Job Information', {
            'fields': ('title', 'description', 'required_skills')
        }),
        ('Job Details', {
            'fields': ('salary', 'location', 'experience_level')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
