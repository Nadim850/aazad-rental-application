from unittest.mock import patch

import pytest
from django.core import mail

from accounts.models import Notification
from core.notifications import (
    send_inapp_notification,
    send_email_notification_async,
    send_notification,
)


class _InstantThread:
    def __init__(self, target, args=(), kwargs=None, daemon=None):
        self._target = target
        self._args = args

    def start(self):
        self._target(*self._args)


@pytest.fixture(autouse=True)
def sync_email_threads():
    with patch('core.notifications.threading.Thread', _InstantThread):
        yield


@pytest.mark.django_db
class TestSendInappNotification:
    def test_creates_notification(self, user):
        result = send_inapp_notification(
            user, 'Title', 'Message body', 'auth', '/dashboard'
        )
        assert result is not None
        assert Notification.objects.filter(user=user, title='Title').exists()

    def test_respects_inapp_preference(self, user):
        user.receive_inapp_notifications = False
        user.save()
        result = send_inapp_notification(user, 'Title', 'Msg', 'auth')
        assert result is None
        assert Notification.objects.filter(user=user).count() == 0


@pytest.mark.django_db
class TestSendEmailNotification:
    def test_sends_email_when_enabled(self, user):
        send_email_notification_async(
            user, 'Test Subject', 'welcome', {'message': 'Hello'}
        )
        assert len(mail.outbox) == 1
        assert mail.outbox[0].subject == 'Test Subject'
        assert user.email in mail.outbox[0].to

    def test_skips_email_when_disabled(self, user):
        user.receive_email_notifications = False
        user.save()
        send_email_notification_async(
            user, 'Test Subject', 'welcome', {'message': 'Hello'}
        )
        assert len(mail.outbox) == 0


@pytest.mark.django_db
class TestSendNotification:
    def test_dispatches_both_channels(self, user):
        send_notification(
            user,
            title='Combined',
            message='Both channels',
            notification_type='payment',
            email_template='welcome',
        )
        assert Notification.objects.filter(user=user, title='Combined').exists()
        assert len(mail.outbox) == 1

    def test_inapp_only_without_email_template(self, user):
        send_notification(
            user,
            title='In-app only',
            message='No email',
            notification_type='admin',
        )
        assert Notification.objects.filter(user=user).exists()
        assert len(mail.outbox) == 0
