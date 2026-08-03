from rest_framework import permissions

class IsEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        is_auth = bool(request.user and request.user.is_authenticated)
        role = getattr(request.user, 'role', '').lower() if is_auth else 'anonymous'
        result = is_auth and role == 'employer'
        if not result:
            print(f"[PERM] IsEmployer DENIED: User={getattr(request.user, 'email', 'Anon')} Role={role} Path={request.path}")
        else:
            print(f"[PERM] IsEmployer GRANTED: User={request.user.email}")
        return result

class IsJobseeker(permissions.BasePermission):
    def has_permission(self, request, view):
        is_auth = bool(request.user and request.user.is_authenticated)
        role = getattr(request.user, 'role', '').lower() if is_auth else 'anonymous'
        result = is_auth and role == 'jobseeker'
        if not result:
            print(f"[PERM] IsJobseeker DENIED: User={getattr(request.user, 'email', 'Anon')} Role={role} Path={request.path}")
        return result

class IsEmployerOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '').lower() == 'employer')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user
