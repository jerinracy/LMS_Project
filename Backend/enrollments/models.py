from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from courses.models import Course


class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-enrolled_at',)
        constraints = [
            models.UniqueConstraint(fields=('student', 'course'), name='unique_student_course_enrollment'),
        ]

    def clean(self):
        super().clean()

        if self.student_id and self.student.role != 'student':
            raise ValidationError({'student': 'Only students can be enrolled in a course.'})

        if self.student_id and self.course_id and self.course.instructor_id == self.student_id:
            raise ValidationError({'student': 'Course instructor cannot be enrolled as a student in the same course.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.student.username} -> {self.course.title}'
