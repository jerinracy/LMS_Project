from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from enrollments.models import Enrollment

from .models import LessonProgress
from .serializers import CourseProgressSerializer, LessonProgressSerializer


class MarkLessonCompleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        serializer = LessonProgressSerializer(data={'lesson_id': lesson_id, 'completed': True}, context={'request': request})
        serializer.is_valid(raise_exception=True)
        progress = serializer.save()
        return Response(LessonProgressSerializer(progress).data, status=status.HTTP_200_OK)


class CourseProgressAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course.objects.prefetch_related('lessons'), pk=course_id)
        if request.user.role != 'student':
            return Response({'detail': 'Only students can view course progress.'}, status=status.HTTP_403_FORBIDDEN)

        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'detail': 'You are not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)

        completed_lessons = LessonProgress.objects.filter(
            student=request.user,
            lesson__course=course,
            completed=True,
        ).count()
        data = CourseProgressSerializer.build(course, completed_lessons)
        return Response(data, status=status.HTTP_200_OK)
