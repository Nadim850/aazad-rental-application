import pytest
from django.utils import timezone
from datetime import timedelta

from bookings.models import Workspace, SubscriptionPlan, Booking


@pytest.mark.django_db
class TestEnsureWorkspacesExistSignal:
    def test_creates_workspaces_on_plan_save(self, db):
        plan = SubscriptionPlan.objects.create(
            name='Cowork Plan',
            workspace_type='coworking',
            monthly_price=3000,
            total_seats=3,
            seat_prefix='CW',
            is_active=True,
        )
        workspaces = Workspace.objects.filter(name__startswith='CW-')
        assert workspaces.count() == 3
        assert Workspace.objects.filter(name='CW-1').exists()

    def test_increases_seats_creates_new_workspaces(self, db):
        plan = SubscriptionPlan.objects.create(
            name='Startup Plan',
            workspace_type='startup',
            monthly_price=5000,
            total_seats=2,
            seat_prefix='ST',
            is_active=True,
        )
        plan.total_seats = 4
        plan.save()
        assert Workspace.objects.filter(name__startswith='ST-').count() == 4

    def test_decreases_seats_removes_excess_workspaces(self, db):
        plan = SubscriptionPlan.objects.create(
            name='Lib Plan',
            workspace_type='library',
            monthly_price=1500,
            total_seats=5,
            seat_prefix='LB',
            is_active=True,
        )
        plan.total_seats = 2
        plan.save()
        remaining = Workspace.objects.filter(name__startswith='LB-')
        assert remaining.count() == 2
        assert not Workspace.objects.filter(name='LB-5').exists()

    def test_skips_when_no_prefix_or_zero_seats(self, db):
        SubscriptionPlan.objects.create(
            name='Empty Plan',
            workspace_type='library',
            monthly_price=1000,
            total_seats=0,
            seat_prefix='',
            is_active=True,
        )
        assert Workspace.objects.count() == 0
