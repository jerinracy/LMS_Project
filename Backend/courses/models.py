from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def clean(self):
        super().clean()
        if self.instructor_id and self.instructor.role != 'instructor':
            raise ValidationError({'instructor': 'Selected user must have instructor role.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    video_url = models.URLField()
    duration = models.PositiveIntegerField()
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ('order', 'id')
        constraints = [
            models.UniqueConstraint(fields=('course', 'order'), name='unique_lesson_order_per_course'),
        ]

    def __str__(self):
        return f'{self.course.title} - {self.title}'
