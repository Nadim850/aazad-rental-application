import pytest
from unittest.mock import patch
from django.utils import timezone
from datetime import timedelta

from accounts.models import Notification
from bookings.models import Booking
from core.scheduler import check_expiring_subscriptions


@pytest.mark.django_db
class TestCheckExpiringSubscriptions:
    def test_sends_7_day_warning(self, user, workspace):
        fixed_now = timezone.now()
        with patch('core.scheduler.timezone.now', return_value=fixed_now):
            Booking.objects.create(
                user=user,
                workspace=workspace,
                start_time=fixed_now - timedelta(days=23),
                end_time=fixed_now + timedelta(days=7, hours=1),
                status='ACTIVE',
                is_paid=True,
            )
            check_expiring_subscriptions()
        assert Notification.objects.filter(
            user=user,
            title='Subscription Expiring Soon',
            notification_type='subscription',
        ).exists()

    def test_sends_3_day_warning(self, user, workspace):
        fixed_now = timezone.now()
        with patch('core.scheduler.timezone.now', return_value=fixed_now):
            Booking.objects.create(
                user=user,
                workspace=workspace,
                start_time=fixed_now - timedelta(days=27),
                end_time=fixed_now + timedelta(days=3, hours=1),
                status='ACTIVE',
                is_paid=True,
            )
            check_expiring_subscriptions()
        assert Notification.objects.filter(
            user=user,
            title='Subscription Expiring in 3 Days',
        ).exists()

    def test_expires_booking_at_zero_days(self, user, workspace):
        fixed_now = timezone.now()
        with patch('core.scheduler.timezone.now', return_value=fixed_now):
            booking = Booking.objects.create(
                user=user,
                workspace=workspace,
                start_time=fixed_now - timedelta(days=31),
                end_time=fixed_now,
                status='ACTIVE',
                is_paid=True,
            )
            check_expiring_subscriptions()
            booking.refresh_from_db()
        assert booking.status == 'EXPIRED'
        assert Notification.objects.filter(
            user=user,
            title='Subscription Expired',
        ).exists()

    def test_ignores_non_active_bookings(self, user, workspace):
        now = timezone.now()
        Booking.objects.create(
            user=user,
            workspace=workspace,
            start_time=now - timedelta(days=31),
            end_time=now + timedelta(days=7),
            status='CANCELLED',
            is_paid=True,
        )
        check_expiring_subscriptions()
        assert Notification.objects.filter(user=user).count() == 0
