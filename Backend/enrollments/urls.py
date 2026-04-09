from django.urls import path

from .views import EnrollCourseAPIView, MyEnrolledCoursesAPIView

urlpatterns = [
    path('enrollments/enroll/', EnrollCourseAPIView.as_view(), name='enroll-course'),
    path('enrollments/my-courses/', MyEnrolledCoursesAPIView.as_view(), name='my-enrolled-courses'),
]
