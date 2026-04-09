from django.contrib import admin

from .models import LessonProgress


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'completed', 'updated_at')
    search_fields = ('student__username', 'lesson__title', 'lesson__course__title')
    list_filter = ('completed', 'updated_at')
