from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Enrollment
from .serializers import EnrollmentCreateSerializer, EnrollmentSerializer


class EnrollCourseAPIView(generics.CreateAPIView):
    serializer_class = EnrollmentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enrollment = serializer.save()
        return Response(EnrollmentSerializer(enrollment).data, status=201)


class MyEnrolledCoursesAPIView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Enrollment.objects.filter(student=self.request.user)
            .select_related('course', 'course__instructor')
            .prefetch_related('course__lessons')
            .order_by('-enrolled_at')
        )
