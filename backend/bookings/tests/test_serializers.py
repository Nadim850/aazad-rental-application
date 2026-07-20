import pytest

from bookings.models import Workspace, Booking
from bookings.serializers import (
    WorkspaceSerializer,
    SubscriptionPlanSerializer,
    BookingSerializer,
    ContactMessageSerializer,
)


@pytest.mark.django_db
class TestWorkspaceSerializer:
    def test_serialization(self, workspace):
        data = WorkspaceSerializer(workspace).data
        assert data['name'] == 'LIB-1'
        assert data['is_available'] is True


@pytest.mark.django_db
class TestSubscriptionPlanSerializer:
    def test_serialization(self, subscription_plan):
        data = SubscriptionPlanSerializer(subscription_plan).data
        assert data['name'] == 'Premium Plan'
        assert data['monthly_price'] == '1999.00'


@pytest.mark.django_db
class TestBookingSerializer:
    def test_includes_nested_workspace_and_user_fields(self, active_booking):
        data = BookingSerializer(active_booking).data
        assert data['workspace']['name'] == 'LIB-1'
        assert data['user_email'] == 'user@example.com'
        assert data['user_first_name'] == 'Test'
        assert data['status'] == 'ACTIVE'


@pytest.mark.django_db
class TestContactMessageSerializer:
    def test_create_contact_message(self):
        data = {
            'name': 'Jane',
            'email': 'jane@example.com',
            'subject': 'Help',
            'message': 'Need assistance',
        }
        serializer = ContactMessageSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        msg = serializer.save()
        assert msg.name == 'Jane'
        assert msg.is_resolved is False
