from unittest.mock import patch, MagicMock

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestSocialLoginView:
    url = reverse('social_login')

    def test_missing_provider_and_token(self, api_client):
        response = api_client.post(self.url, {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data

    def test_unsupported_provider(self, api_client):
        response = api_client.post(self.url, {
            'provider': 'facebook',
            'token': 'some-token',
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch('accounts.social_views.id_token.verify_oauth2_token')
    def test_google_login_creates_user(self, mock_verify, api_client):
        mock_verify.return_value = {
            'email': 'google@example.com',
            'given_name': 'Google',
            'family_name': 'User',
        }
        response = api_client.post(self.url, {
            'provider': 'google',
            'token': 'valid-google-token',
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    @patch('accounts.social_views.id_token.verify_oauth2_token')
    def test_google_login_existing_user(self, mock_verify, api_client, user):
        mock_verify.return_value = {
            'email': user.email,
            'given_name': user.first_name,
            'family_name': user.last_name,
        }
        response = api_client.post(self.url, {
            'provider': 'google',
            'token': 'valid-google-token',
        })
        assert response.status_code == status.HTTP_200_OK

    @patch('accounts.social_views.id_token.verify_oauth2_token')
    def test_google_invalid_token(self, mock_verify, api_client):
        mock_verify.side_effect = ValueError('Invalid token')
        response = api_client.post(self.url, {
            'provider': 'google',
            'token': 'bad-token',
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch('accounts.social_views.requests.get')
    @patch('accounts.social_views.requests.post')
    def test_github_login_success(self, mock_post, mock_get, api_client):
        mock_post.return_value = MagicMock(
            json=lambda: {'access_token': 'gh-token'}
        )
        mock_get.side_effect = [
            MagicMock(json=lambda: [
                {'email': 'github@example.com', 'primary': True, 'verified': True}
            ]),
            MagicMock(json=lambda: {'name': 'Git Hub', 'login': 'ghuser'}),
        ]
        response = api_client.post(self.url, {
            'provider': 'github',
            'token': 'auth-code',
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    @patch('accounts.social_views.requests.post')
    def test_github_invalid_code(self, mock_post, api_client):
        mock_post.return_value = MagicMock(json=lambda: {})
        response = api_client.post(self.url, {
            'provider': 'github',
            'token': 'bad-code',
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
