import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from bookings.models import Workspace, SubscriptionPlan, Booking, ContactMessage

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email='user@example.com',
        password='TestPass123!',
        first_name='Test',
        last_name='User',
        phone_number='9876543210',
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email='admin@example.com',
        password='AdminPass123!',
        first_name='Admin',
        last_name='User',
    )


@pytest.fixture
def auth_client(api_client, user):
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def workspace(db):
    return Workspace.objects.create(
        name='LIB-1',
        workspace_type='library',
        price_per_hour=50.00,
        is_available=True,
    )


@pytest.fixture
def subscription_plan(db):
    return SubscriptionPlan.objects.create(
        name='Premium Plan',
        workspace_type='library',
        description='Full access library plan',
        monthly_price=1999.00,
        features=['WiFi', 'AC'],
        total_seats=5,
        seat_prefix='LIB',
        is_active=True,
    )


@pytest.fixture
def active_booking(db, user, workspace):
    from django.utils import timezone
    from datetime import timedelta

    now = timezone.now()
    return Booking.objects.create(
        user=user,
        workspace=workspace,
        start_time=now - timedelta(days=1),
        end_time=now + timedelta(days=29),
        is_paid=True,
        status='ACTIVE',
        amount_paid=1999.00,
        plan_name='Premium Plan',
    )


@pytest.fixture
def contact_message(db):
    return ContactMessage.objects.create(
        name='John Doe',
        email='john@example.com',
        phone='1234567890',
        subject='Inquiry',
        message='I have a question about pricing.',
    )
