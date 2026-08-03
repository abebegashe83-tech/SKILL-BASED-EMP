from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile, JobseekerProfile, EmployerProfile
from django.db import connection

class IsStaffFilter(admin.SimpleListFilter):
    title = 'Staff Status'
    parameter_name = 'is_staff'

    def lookups(self, request, model_admin):
        return (
            ('yes', 'Admin/Staff'),
            ('no', 'Regular User'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(is_staff=True)
        if self.value() == 'no':
            return queryset.filter(is_staff=False)
        return queryset

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = (IsStaffFilter, 'role', 'is_active')
    search_fields = ('email',)
    ordering = ('-date_joined',)
    list_per_page = 20
    date_hierarchy = 'date_joined'
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('date_joined', 'last_login')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role'),
        }),
    )
    
    inlines = []
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'full_name', 'location', 'phone')
    list_filter = ('location',)
    search_fields = ('user__email', 'full_name', 'location', 'phone')
    list_per_page = 20
    ordering = ('-id',)
    readonly_fields = ('user',)
    
    def user_email(self, obj):
        try:
            return obj.user.email if obj.user else "N/A"
        except Exception:
            return "N/A"
    user_email.short_description = 'User Email'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'full_name', 'bio')
        }),
        ('Skills', {
            'fields': ('skills',)
        }),
        ('Experience & Education', {
            'fields': ('experience', 'education')
        }),
        ('Documents', {
            'fields': ('resume',)
        }),
        ('Contact', {
            'fields': ('phone', 'location')
        }),
        ('Social', {
            'fields': ('linkedin', 'github')
        }),
    )

@admin.register(JobseekerProfile)
class JobseekerProfileAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'title', 'location', 'education')
    search_fields = ('user__email', 'title', 'location')
    list_filter = ('location',)
    list_per_page = 20
    ordering = ('-id',)
    readonly_fields = ('user',)
    
    def user_email(self, obj):
        try:
            return obj.user.email
        except Exception:
            return "N/A"
    user_email.short_description = 'User'

@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'company_name', 'industry', 'company_size')
    list_filter = ('industry', 'company_size')
    search_fields = ('user__email', 'company_name', 'industry')
    list_per_page = 20
    ordering = ('-id',)
    readonly_fields = ('user',)
    
    def user_email(self, obj):
        try:
            return obj.user.email
        except Exception:
            return "N/A"
    user_email.short_description = 'User'
