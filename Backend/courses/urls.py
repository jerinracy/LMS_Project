from django.urls import path

from .views import (
    CourseListCreateAPIView,
    CourseRetrieveUpdateDestroyAPIView,
    LessonListCreateAPIView,
    LessonRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path('courses/', CourseListCreateAPIView.as_view(), name='course-list-create'),
    path('courses/<int:pk>/', CourseRetrieveUpdateDestroyAPIView.as_view(), name='course-detail'),
    path('courses/<int:course_id>/lessons/', LessonListCreateAPIView.as_view(), name='lesson-list-create'),
    path(
        'courses/<int:course_id>/lessons/<int:pk>/',
        LessonRetrieveUpdateDestroyAPIView.as_view(),
        name='lesson-detail',
    ),
]
