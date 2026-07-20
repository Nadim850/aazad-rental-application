import pytest
from django.urls import reverse
from rest_framework import status

from accounts.models import Notification, User


@pytest.mark.django_db
class TestRegisterView:
    url = reverse('register')

    def test_register_success(self, api_client):
        response = api_client.post(self.url, {
            'email': 'register@example.com',
            'password': 'RegisterPass123!',
            'first_name': 'Reg',
            'last_name': 'User',
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email='register@example.com').exists()
        assert Notification.objects.filter(
            user__email='register@example.com',
            notification_type='auth',
        ).exists()

    def test_register_duplicate_email_fails(self, api_client, user):
        response = api_client.post(self.url, {
            'email': user.email,
            'password': 'AnotherPass123!',
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestAuthEndpoints:
    def test_login_returns_tokens(self, api_client, user):
        url = reverse('token_obtain_pair')
        response = api_client.post(url, {
            'email': user.email,
            'password': 'TestPass123!',
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_invalid_credentials(self, api_client, user):
        url = reverse('token_obtain_pair')
        response = api_client.post(url, {
            'email': user.email,
            'password': 'wrongpassword',
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestCurrentUserView:
    url = reverse('current_user')

    def test_authenticated_user_gets_profile(self, auth_client, user):
        response = auth_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email

    def test_unauthenticated_denied(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestAdminUserListView:
    url = reverse('admin_user_list')

    def test_admin_can_list_users(self, admin_client, user):
        response = admin_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        emails = [u['email'] for u in response.data]
        assert user.email in emails

    def test_regular_user_denied(self, auth_client):
        response = auth_client.get(self.url)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestNotificationViews:
    def test_list_notifications(self, auth_client, user):
        Notification.objects.create(
            user=user, title='T1', message='M1', notification_type='auth'
        )
        url = reverse('notification_list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_mark_notification_read(self, auth_client, user):
        notification = Notification.objects.create(
            user=user, title='T1', message='M1', notification_type='auth'
        )
        url = reverse('notification_read', kwargs={'pk': notification.pk})
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.is_read is True

    def test_mark_notification_read_not_found(self, auth_client):
        url = reverse('notification_read', kwargs={'pk': 99999})
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_read_all_notifications(self, auth_client, user):
        Notification.objects.create(
            user=user, title='T1', message='M1', notification_type='auth'
        )
        Notification.objects.create(
            user=user, title='T2', message='M2', notification_type='payment'
        )
        url = reverse('notification_read_all')
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert Notification.objects.filter(user=user, is_read=False).count() == 0

    def test_delete_notification(self, auth_client, user):
        notification = Notification.objects.create(
            user=user, title='T1', message='M1', notification_type='auth'
        )
        url = reverse('notification_delete', kwargs={'pk': notification.pk})
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Notification.objects.filter(pk=notification.pk).exists()


@pytest.mark.django_db
class TestUpdatePreferencesView:
    url = reverse('update_preferences')

    def test_update_email_preference(self, auth_client, user):
        response = auth_client.patch(self.url, {'receive_email_notifications': False})
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.receive_email_notifications is False

    def test_update_inapp_preference(self, auth_client, user):
        response = auth_client.patch(self.url, {'receive_inapp_notifications': False})
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.receive_inapp_notifications is False
