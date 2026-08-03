from rest_framework import permissions

class IsJobseeker(permissions.BasePermission):
    """
    Allows access only to jobseekers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role.lower() == 'jobseeker')

class IsEmployer(permissions.BasePermission):
    """
    Allows access only to employers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role.lower() == 'employer')

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role.lower() == 'admin')
