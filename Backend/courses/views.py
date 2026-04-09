from django.shortcuts import get_object_or_404
from django.db.models import BooleanField, Exists, OuterRef, Value
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied, ValidationError

from enrollments.models import Enrollment

from .models import Course, Lesson
from .permissions import IsInstructor
from .serializers import (
    CourseDetailSerializer,
    CourseListSerializer,
    CourseWriteSerializer,
    LessonSerializer,
)


class CourseListCreateAPIView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsInstructor()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Course.objects.select_related('instructor')
        user = self.request.user

        if user.is_authenticated and user.role == 'student':
            enrollment_exists = Enrollment.objects.filter(student=user, course_id=OuterRef('pk'))
            return queryset.annotate(is_enrolled=Exists(enrollment_exists))

        return queryset.annotate(is_enrolled=Value(False, output_field=BooleanField()))

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseWriteSerializer
        return CourseListSerializer

    def perform_create(self, serializer):
        if self.request.user.role == 'admin' or self.request.user.is_superuser:
            instructor = serializer.validated_data.get('instructor')
            if not instructor:
                raise ValidationError({'instructor': 'This field is required for admin users.'})
            serializer.save(instructor=instructor)
            return
        serializer.save(instructor=self.request.user)


class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        queryset = Course.objects.select_related('instructor').prefetch_related('lessons')
        user = self.request.user

        if user.is_authenticated and user.role == 'student':
            enrollment_exists = Enrollment.objects.filter(student=user, course_id=OuterRef('pk'))
            return queryset.annotate(is_enrolled=Exists(enrollment_exists))

        return queryset.annotate(is_enrolled=Value(False, output_field=BooleanField()))

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsInstructor()]

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return CourseDetailSerializer
        return CourseWriteSerializer

    def perform_update(self, serializer):
        course = self.get_object()
        is_admin = self.request.user.role == 'admin' or self.request.user.is_superuser
        if not is_admin and course.instructor != self.request.user:
            raise PermissionDenied('You can only update your own courses.')
        if is_admin:
            serializer.save()
            return
        serializer.save(instructor=course.instructor)

    def perform_destroy(self, instance):
        is_admin = self.request.user.role == 'admin' or self.request.user.is_superuser
        if not is_admin and instance.instructor != self.request.user:
            raise PermissionDenied('You can only delete your own courses.')
        instance.delete()


class LessonListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = LessonSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsInstructor()]
        return [permissions.AllowAny()]

    def get_course(self):
        return get_object_or_404(Course, pk=self.kwargs['course_id'])

    def get_queryset(self):
        return Lesson.objects.filter(course_id=self.kwargs['course_id']).order_by('order', 'id')

    def perform_create(self, serializer):
        course = self.get_course()
        is_admin = self.request.user.role == 'admin' or self.request.user.is_superuser
        if not is_admin and course.instructor != self.request.user:
            raise PermissionDenied('You can only add lessons to your own courses.')
        serializer.save(course=course)


class LessonRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LessonSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsInstructor()]

    def get_object(self):
        return get_object_or_404(
            Lesson.objects.select_related('course', 'course__instructor'),
            pk=self.kwargs['pk'],
            course_id=self.kwargs['course_id'],
        )

    def perform_update(self, serializer):
        lesson = self.get_object()
        is_admin = self.request.user.role == 'admin' or self.request.user.is_superuser
        if not is_admin and lesson.course.instructor != self.request.user:
            raise PermissionDenied('You can only update lessons in your own courses.')
        serializer.save()

    def perform_destroy(self, instance):
        is_admin = self.request.user.role == 'admin' or self.request.user.is_superuser
        if not is_admin and instance.course.instructor != self.request.user:
            raise PermissionDenied('You can only delete lessons in your own courses.')
        instance.delete()
