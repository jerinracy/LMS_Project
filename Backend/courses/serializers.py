from rest_framework import serializers

from users.models import User
from users.serializers import UserSerializer

from .models import Course, Lesson


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'course', 'title', 'video_url', 'duration', 'order')
        read_only_fields = ('id', 'course')

    def validate_video_url(self, value):
        value_lower = value.lower()
        if 'youtube.com' not in value_lower and 'youtu.be' not in value_lower and 'vimeo.com' not in value_lower:
            raise serializers.ValidationError('Video URL must be from YouTube or Vimeo.')
        return value


class CourseListSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    lesson_count = serializers.IntegerField(source='lessons.count', read_only=True)
    is_enrolled = serializers.BooleanField(read_only=True)
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'thumbnail', 'instructor', 'created_at', 'lesson_count', 'is_enrolled')

    def get_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    is_enrolled = serializers.BooleanField(read_only=True)
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'thumbnail', 'instructor', 'created_at', 'lessons', 'is_enrolled')

    def get_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class CourseWriteSerializer(serializers.ModelSerializer):
    instructor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.ROLE_INSTRUCTOR),
        required=False,
    )

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'thumbnail', 'instructor', 'created_at')
        read_only_fields = ('id', 'created_at')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and instance.thumbnail:
            data['thumbnail'] = request.build_absolute_uri(instance.thumbnail.url)
        return data
