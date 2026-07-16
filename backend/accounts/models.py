from django.db import models

from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    """Custom manager where email is the unique identifier."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None  # Remove default username field
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    receive_email_notifications = models.BooleanField(default=True)
    receive_inapp_notifications = models.BooleanField(default=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('auth', 'Authentication'),
        ('subscription', 'Subscription'),
        ('payment', 'Payment'),
        ('contact', 'Contact'),
        ('admin', 'Admin Event'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.email}"