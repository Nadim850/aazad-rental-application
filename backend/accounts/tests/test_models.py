import pytest
from django.contrib.auth import get_user_model

from accounts.models import Notification

User = get_user_model()


@pytest.mark.django_db
class TestUserManager:
    def test_create_user_requires_email(self):
        with pytest.raises(ValueError, match='Email address must be set'):
            User.objects.create_user(email='', password='pass')

    def test_create_user_success(self):
        user = User.objects.create_user(
            email='new@example.com',
            password='SecurePass123!',
            first_name='New',
            last_name='User',
        )
        assert user.email == 'new@example.com'
        assert user.check_password('SecurePass123!')
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email='super@example.com',
            password='AdminPass123!',
        )
        assert admin.is_staff is True
        assert admin.is_superuser is True


@pytest.mark.django_db
class TestUserModel:
    def test_str_returns_email(self, user):
        assert str(user) == 'user@example.com'

    def test_default_notification_preferences(self, user):
        assert user.receive_email_notifications is True
        assert user.receive_inapp_notifications is True


@pytest.mark.django_db
class TestNotificationModel:
    def test_str_representation(self, user):
        notification = Notification.objects.create(
            user=user,
            title='Test Alert',
            message='Hello world',
            notification_type='auth',
        )
        assert str(notification) == 'Test Alert - user@example.com'

    def test_default_ordering_newest_first(self, user):
        n1 = Notification.objects.create(
            user=user, title='First', message='m1', notification_type='auth'
        )
        n2 = Notification.objects.create(
            user=user, title='Second', message='m2', notification_type='auth'
        )
        titles = list(
            Notification.objects.filter(user=user).values_list('title', flat=True)
        )
        assert titles[0] == n2.title
        assert titles[1] == n1.title
