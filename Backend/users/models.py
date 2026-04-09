from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields['role'] = User.ROLE_ADMIN
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    ROLE_ADMIN = 'admin'
    ROLE_STUDENT = 'student'
    ROLE_INSTRUCTOR = 'instructor'
    ROLE_CHOICES = (
        (ROLE_ADMIN, 'Admin'),
        (ROLE_STUDENT, 'Student'),
        (ROLE_INSTRUCTOR, 'Instructor'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.ROLE_ADMIN
            self.is_staff = True
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.username} ({self.role})'
