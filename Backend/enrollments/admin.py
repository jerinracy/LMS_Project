from django.contrib import admin

from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at')
    search_fields = ('student__username', 'course__title')
    list_filter = ('enrolled_at',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'student':
            kwargs['queryset'] = db_field.remote_field.model.objects.filter(role='student')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
