from rest_framework import serializers

from courses.models import Course, Lesson
from enrollments.models import Enrollment

from .models import LessonProgress


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_id = serializers.IntegerField(write_only=True)
    lesson = serializers.IntegerField(source='lesson.id', read_only=True)

    class Meta:
        model = LessonProgress
        fields = ('id', 'lesson_id', 'lesson', 'completed', 'updated_at')
        read_only_fields = ('id', 'updated_at')

    def validate_lesson_id(self, value):
        if not Lesson.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Lesson does not exist.')
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        if user.role != 'student':
            raise serializers.ValidationError({'detail': 'Only students can track lesson progress.'})

        lesson = Lesson.objects.select_related('course').get(pk=attrs['lesson_id'])
        if not Enrollment.objects.filter(student=user, course=lesson.course).exists():
            raise serializers.ValidationError({'detail': 'You must enroll in the course before tracking progress.'})
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        lesson = Lesson.objects.get(pk=validated_data['lesson_id'])
        progress, _ = LessonProgress.objects.get_or_create(student=user, lesson=lesson, defaults={'completed': True})
        progress.completed = True
        progress.save(update_fields=['completed', 'updated_at'])
        return progress


class CourseProgressSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    total_lessons = serializers.IntegerField()
    completed_lessons = serializers.IntegerField()
    progress_percentage = serializers.FloatField()

    @staticmethod
    def build(course: Course, completed_lessons: int):
        total_lessons = course.lessons.count()
        percentage = 0.0 if total_lessons == 0 else round((completed_lessons / total_lessons) * 100, 2)
        return {
            'course_id': course.id,
            'course_title': course.title,
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'progress_percentage': percentage,
        }
