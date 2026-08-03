from django.contrib import admin
from .models import Application

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'job', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'job__title', 'status')
    readonly_fields = ('applied_at',)
    list_per_page = 20
    ordering = ('-applied_at',)
    list_editable = ('status',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'job')
    
    fieldsets = (
        ('Application Details', {
            'fields': ('user', 'job', 'status')
        }),
        ('Metadata', {
            'fields': ('applied_at',),
            'classes': ('collapse',)
        }),
    )
