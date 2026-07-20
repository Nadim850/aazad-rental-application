import pytest

from accounts.models import Notification
from accounts.serializers import UserSerializer, NotificationSerializer


@pytest.mark.django_db
class TestUserSerializer:
    def test_create_user_via_serializer(self):
        data = {
            'email': 'serializer@example.com',
            'password': 'ValidPass123!',
            'first_name': 'Ser',
            'last_name': 'Alizer',
            'phone_number': '9999888877',
        }
        serializer = UserSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        assert user.email == 'serializer@example.com'
        assert user.check_password('ValidPass123!')

    def test_rejects_weak_password(self):
        data = {'email': 'weak@example.com', 'password': '123'}
        serializer = UserSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_password_is_write_only(self, user):
        serializer = UserSerializer(user)
        assert 'password' not in serializer.data


@pytest.mark.django_db
class TestNotificationSerializer:
    def test_serialization(self, user):
        notification = Notification.objects.create(
            user=user,
            title='Payment',
            message='Paid successfully',
            notification_type='payment',
            action_url='/receipt/1',
        )
        data = NotificationSerializer(notification).data
        assert data['title'] == 'Payment'
        assert data['notification_type'] == 'payment'
        assert data['is_read'] is False
        assert 'created_at' in data
