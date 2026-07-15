import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from bookings.models import Workspace, Booking

User = get_user_model()

def seed():
    # 1. Get the first user
    user = User.objects.first()
    if not user:
        print("No users found. Please create a user first (e.g. by logging in or signing up).")
        return

    # 2. Create Workspace L-12
    workspace, created = Workspace.objects.get_or_create(
        name="L-12",
        defaults={
            'workspace_type': 'library',
            'price_per_hour': 50.00,
            'is_available': False
        }
    )
    
    # 3. Create active booking for this user
    now = timezone.now()
    start_time = now - timedelta(days=2) # Purchased 2 days ago
    end_time = now + timedelta(days=30)  # Expires in 30 days
    
    # Check if a booking already exists
    booking, created = Booking.objects.get_or_create(
        user=user,
        workspace=workspace,
        defaults={
            'start_time': start_time,
            'end_time': end_time,
            'is_paid': True
        }
    )
    
    # 4. Create some past invoices
    for i in range(1, 4):
        Booking.objects.get_or_create(
            user=user,
            workspace=workspace,
            start_time=now - timedelta(days=i*30 + 2),
            end_time=now - timedelta(days=i*30 - 28),
            defaults={'is_paid': True}
        )

    print(f"Successfully seeded dynamic data for user: {user.email}")

if __name__ == '__main__':
    seed()
