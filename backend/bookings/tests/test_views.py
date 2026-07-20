from unittest.mock import patch, MagicMock

import pytest
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status

from accounts.models import Notification, User
from bookings.models import Workspace, Booking, ContactMessage, SubscriptionPlan


@pytest.mark.django_db
class TestDashboardView:
    url = reverse('my-dashboard')

    def test_returns_dashboard_sections(self, auth_client, active_booking):
        response = auth_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert 'active_subscription' in response.data
        assert 'upcoming_subscriptions' in response.data
        assert 'subscription_history' in response.data
        assert 'payment_history' in response.data
        assert response.data['active_subscription'] is not None

    def test_expires_past_active_bookings(self, auth_client, user, workspace):
        now = timezone.now()
        Booking.objects.create(
            user=user,
            workspace=workspace,
            start_time=now - timedelta(days=60),
            end_time=now - timedelta(days=1),
            status='ACTIVE',
            is_paid=True,
        )
        workspace.is_available = False
        workspace.save()

        response = auth_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        booking = Booking.objects.get(workspace=workspace)
        assert booking.status == 'EXPIRED'
        workspace.refresh_from_db()
        assert workspace.is_available is True

    def test_activates_upcoming_bookings(self, auth_client, user, workspace):
        now = timezone.now()
        Booking.objects.create(
            user=user,
            workspace=workspace,
            start_time=now - timedelta(hours=1),
            end_time=now + timedelta(days=29),
            status='UPCOMING',
            is_paid=True,
        )
        response = auth_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        booking = Booking.objects.get(workspace=workspace)
        assert booking.status == 'ACTIVE'


@pytest.mark.django_db
class TestBookSeatView:
    url = reverse('book-seat')

    def test_book_seat_success(self, auth_client, workspace):
        response = auth_client.post(self.url, {'seat_id': workspace.name})
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['booking']['status'] == 'ACTIVE'
        workspace.refresh_from_db()
        assert workspace.is_available is False

    def test_book_seat_missing_id(self, auth_client):
        response = auth_client.post(self.url, {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_book_seat_not_found(self, auth_client):
        response = auth_client.post(self.url, {'seat_id': 'MISSING-1'})
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_book_unavailable_seat_by_other_user(self, auth_client, user, workspace, db):
        other = User.objects.create_user(
            email='other@example.com', password='OtherPass123!'
        )
        workspace.is_available = False
        workspace.save()
        now = timezone.now()
        Booking.objects.create(
            user=other,
            workspace=workspace,
            start_time=now,
            end_time=now + timedelta(days=30),
            status='ACTIVE',
            is_paid=True,
        )
        response = auth_client.post(self.url, {'seat_id': workspace.name})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_second_booking_is_upcoming(self, auth_client, active_booking, db):
        ws2 = Workspace.objects.create(
            name='LIB-2', workspace_type='library', price_per_hour=50, is_available=True
        )
        response = auth_client.post(self.url, {'seat_id': ws2.name})
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['booking']['status'] == 'UPCOMING'


@pytest.mark.django_db
class TestPublicEndpoints:
    def test_public_plans_list(self, api_client, subscription_plan):
        url = reverse('public-plans')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_public_plans_excludes_inactive(self, api_client, db):
        SubscriptionPlan.objects.create(
            name='Inactive', workspace_type='library',
            monthly_price=999, is_active=False,
        )
        url = reverse('public-plans')
        response = api_client.get(url)
        names = [p['name'] for p in response.data]
        assert 'Inactive' not in names

    def test_public_workspaces_list(self, api_client, workspace):
        url = reverse('public-workspaces')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert any(w['name'] == 'LIB-1' for w in response.data)


@pytest.mark.django_db
class TestAdminViewSets:
    def test_admin_create_workspace(self, admin_client):
        url = reverse('admin-workspace-list')
        response = admin_client.post(url, {
            'name': 'ADMIN-WS',
            'workspace_type': 'coworking',
            'price_per_hour': '100.00',
            'is_available': True,
        })
        assert response.status_code == status.HTTP_201_CREATED

    def test_regular_user_cannot_create_workspace(self, auth_client):
        url = reverse('admin-workspace-list')
        response = auth_client.post(url, {
            'name': 'HACK-WS',
            'workspace_type': 'coworking',
            'price_per_hour': '100.00',
        })
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_crud_plans(self, admin_client):
        url = reverse('admin-plan-list')
        response = admin_client.post(url, {
            'name': 'Admin Plan',
            'workspace_type': 'library',
            'monthly_price': '2500.00',
            'is_active': True,
        })
        assert response.status_code == status.HTTP_201_CREATED
        plan_id = response.data['id']
        detail_url = reverse('admin-plan-detail', kwargs={'pk': plan_id})
        response = admin_client.delete(detail_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestAdminUserViews:
    def test_detailed_users_list(self, admin_client, user, active_booking):
        url = reverse('admin-detailed-users')
        response = admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert any(u['email'] == user.email for u in response.data)

    def test_delete_user(self, admin_client, user):
        url = reverse('admin-user-detail', kwargs={'pk': user.pk})
        response = admin_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(pk=user.pk).exists()

    def test_admin_cannot_delete_self(self, admin_client, admin_user):
        url = reverse('admin-user-detail', kwargs={'pk': admin_user.pk})
        response = admin_client.delete(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestContactMessageViews:
    def test_create_contact_message_anonymous(self, api_client, admin_user):
        url = reverse('contact-message')
        response = api_client.post(url, {
            'name': 'Visitor',
            'email': 'visitor@example.com',
            'subject': 'Question',
            'message': 'Hello there',
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert ContactMessage.objects.filter(email='visitor@example.com').exists()
        assert Notification.objects.filter(
            user=admin_user, notification_type='contact'
        ).exists()

    def test_create_contact_message_authenticated(self, auth_client, user, admin_user):
        url = reverse('contact-message')
        response = auth_client.post(url, {
            'name': user.first_name,
            'email': user.email,
            'subject': 'Help',
            'message': 'Need help',
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert Notification.objects.filter(user=user, notification_type='contact').exists()

    def test_admin_list_contact_messages(self, admin_client, contact_message):
        url = reverse('admin-contact-list')
        response = admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_admin_update_contact_resolved(self, admin_client, contact_message):
        url = reverse('admin-contact-detail', kwargs={'pk': contact_message.pk})
        response = admin_client.patch(url, {'is_resolved': True})
        assert response.status_code == status.HTTP_200_OK
        contact_message.refresh_from_db()
        assert contact_message.is_resolved is True


@pytest.mark.django_db
class TestRazorpayViews:
    @patch('bookings.views.razorpay_client')
    def test_create_order_success(self, mock_client, auth_client, workspace, subscription_plan):
        mock_client.order.create.return_value = {
            'id': 'order_test123',
            'amount': 199900,
            'currency': 'INR',
        }
        url = reverse('create-razorpay-order')
        response = auth_client.post(url, {
            'seat_id': workspace.name,
            'plan_type': subscription_plan.name,
            'months': 1,
        })
        assert response.status_code == status.HTTP_200_OK
        assert response.data['order_id'] == 'order_test123'

    def test_create_order_missing_seat(self, auth_client):
        url = reverse('create-razorpay-order')
        response = auth_client.post(url, {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch('bookings.views.razorpay_client', None)
    def test_create_order_no_razorpay_client(self, auth_client, workspace):
        url = reverse('create-razorpay-order')
        response = auth_client.post(url, {'seat_id': workspace.name})
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    @patch('bookings.views.razorpay_client')
    def test_verify_payment_success(self, mock_client, auth_client, workspace, subscription_plan):
        mock_client.utility.verify_payment_signature.return_value = True
        url = reverse('verify-razorpay-payment')
        response = auth_client.post(url, {
            'razorpay_order_id': 'order_abc',
            'razorpay_payment_id': 'pay_abc',
            'razorpay_signature': 'sig_abc',
            'seat_id': workspace.name,
            'plan_type': subscription_plan.name,
            'months': 1,
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert Booking.objects.filter(razorpay_order_id='order_abc').exists()
        assert Notification.objects.filter(notification_type='payment').exists()

    @patch('bookings.views.razorpay_client')
    def test_verify_payment_invalid_signature(self, mock_client, auth_client, workspace):
        import razorpay
        mock_client.utility.verify_payment_signature.side_effect = (
            razorpay.errors.SignatureVerificationError('bad sig')
        )
        url = reverse('verify-razorpay-payment')
        response = auth_client.post(url, {
            'razorpay_order_id': 'order_abc',
            'razorpay_payment_id': 'pay_abc',
            'razorpay_signature': 'bad_sig',
            'seat_id': workspace.name,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestBookingDetailView:
    def test_user_can_view_own_booking(self, auth_client, active_booking):
        url = reverse('booking-detail', kwargs={'pk': active_booking.pk})
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == active_booking.pk

    def test_user_cannot_view_others_booking(self, api_client, active_booking, db):
        other = User.objects.create_user(
            email='other2@example.com', password='OtherPass123!'
        )
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(other)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')

        url = reverse('booking-detail', kwargs={'pk': active_booking.pk})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_admin_can_view_any_booking(self, admin_client, active_booking):
        url = reverse('booking-detail', kwargs={'pk': active_booking.pk})
        response = admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
