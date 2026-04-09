from rest_framework import serializers

from courses.models import Course
from courses.serializers import CourseListSerializer

from .models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'course', 'enrolled_at')


class EnrollmentCreateSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()

    def validate_course_id(self, value):
        if not Course.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Course does not exist.')
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        course = Course.objects.get(pk=attrs['course_id'])

        if user.role != 'student':
            raise serializers.ValidationError({'detail': 'Only students can enroll in courses.'})

        if course.instructor_id == user.id:
            raise serializers.ValidationError({'detail': 'Course instructor cannot be enrolled as a student in the same course.'})

        if Enrollment.objects.filter(student=user, course_id=attrs['course_id']).exists():
            raise serializers.ValidationError({'detail': 'You are already enrolled in this course.'})

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        course = Course.objects.get(pk=validated_data['course_id'])
        return Enrollment.objects.create(student=user, course=course)
