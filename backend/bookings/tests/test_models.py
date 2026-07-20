import pytest
from decimal import Decimal

from bookings.models import Workspace, SubscriptionPlan, Booking, ContactMessage


@pytest.mark.django_db
class TestWorkspaceModel:
    def test_str_representation(self, workspace):
        assert str(workspace) == 'LIB-1'

    def test_defaults(self, workspace):
        assert workspace.is_available is True
        assert workspace.workspace_type == 'library'


@pytest.mark.django_db
class TestSubscriptionPlanModel:
    def test_str_representation(self, subscription_plan):
        assert str(subscription_plan) == 'Premium Plan'

    def test_defaults(self, subscription_plan):
        assert subscription_plan.is_active is True
        assert subscription_plan.features == ['WiFi', 'AC']


@pytest.mark.django_db
class TestBookingModel:
    def test_str_representation(self, active_booking):
        assert 'LIB-1' in str(active_booking)
        assert 'user@example.com' in str(active_booking)

    def test_default_status(self, user, workspace):
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        booking = Booking.objects.create(
            user=user,
            workspace=workspace,
            start_time=now,
            end_time=now + timedelta(days=30),
        )
        assert booking.status == 'ACTIVE'
        assert booking.is_paid is False
        assert booking.amount_paid == Decimal('0.00')


@pytest.mark.django_db
class TestContactMessageModel:
    def test_str_representation(self, contact_message):
        assert 'John Doe' in str(contact_message)
        assert 'Inquiry' in str(contact_message)

    def test_is_resolved_default_false(self, contact_message):
        assert contact_message.is_resolved is False
