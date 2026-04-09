from django.urls import path

from .views import CourseProgressAPIView, MarkLessonCompleteAPIView

urlpatterns = [
    path('progress/lessons/<int:lesson_id>/complete/', MarkLessonCompleteAPIView.as_view(), name='mark-lesson-complete'),
    path('progress/courses/<int:course_id>/', CourseProgressAPIView.as_view(), name='course-progress'),
]
