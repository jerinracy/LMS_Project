from django.contrib import admin

from .models import Course, Lesson


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'created_at')
    search_fields = ('title', 'description', 'instructor__username')
    list_filter = ('created_at',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'instructor':
            kwargs['queryset'] = db_field.remote_field.model.objects.filter(role='instructor')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'duration')
    search_fields = ('title', 'course__title')
    list_filter = ('course',)
