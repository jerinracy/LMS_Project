from rest_framework.permissions import BasePermission


class IsInstructor(BasePermission):
    message = 'Only instructors or admins can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role in ('instructor', 'admin'))
        )
