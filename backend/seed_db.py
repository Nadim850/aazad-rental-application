import os
import django
import sys

sys.path.append(r"/app")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from bookings.models import SubscriptionPlan, Workspace

plans = [
    {
        "name": "Silent Reader Plan",
        "workspace_type": "library",
        "description": "For deep focus and quiet study. Access to silent reading zones with high-speed Wi-Fi.",
        "monthly_price": 499.00,
        "features": [
            "24/7 Access",
            "High-speed Wi-Fi",
            "Air Conditioned",
            "Locker Facility",
            "Charging Ports"
        ],
        "total_seats": 26,
        "seat_prefix": "L"
    },
    {
        "name": "Dedicated Desk",
        "workspace_type": "dedicated",
        "description": "Perfect for freelancers and remote workers. Dedicated desk in a collaborative environment.",
        "monthly_price": 2999.00,
        "features": [
            "Dedicated Desk",
            "Ergonomic Chair",
            "Meeting Room Access",
            "Pantry & Coffee",
            "Printing Services"
        ],
        "total_seats": 6,
        "seat_prefix": "D"
    },
    {
        "name": "Private Cabin",
        "workspace_type": "cabin",
        "description": "Fully furnished, soundproof private offices for growing startups.",
        "monthly_price": 4999.00,
        "price_3_months": 10000.00,
        "price_6_months": 15000.00,
        "price_1_year": 30000.00,
        "features": [
            "Customizable layout",
            "Mail & package handling",
            "10 hrs meeting room/mo",
            "Dedicated IT infrastructure",
            "24/7 Access"
        ],
        "total_seats": 3,
        "seat_prefix": "P"
    },
    {
        "name": "Conference Room",
        "workspace_type": "startup",
        "description": "Ideal for small teams and startups. Fully furnished private cabin with secure access.",
        "monthly_price": 9999.00,
        "features": [
            "Private Cabin",
            "Custom Branding",
            "Priority Support",
            "Mail Handling",
            "Free Conference Room"
        ],
        "total_seats": 6,
        "seat_prefix": "S"
    }
]

for plan_data in plans:
    plan, created = SubscriptionPlan.objects.update_or_create(
        name=plan_data["name"],
        defaults=plan_data
    )
    if created:
        print(f"Created plan: {plan.name}")
    else:
        print(f"Updated plan: {plan.name}")

# Auto-generate workspaces/seats based on plans
for plan in SubscriptionPlan.objects.all():
    for i in range(1, plan.total_seats + 1):
        seat_name = f"{plan.seat_prefix}-{i}"
        workspace, created = Workspace.objects.get_or_create(
            name=seat_name,
            defaults={
                'workspace_type': plan.workspace_type,
                'price_per_hour': 50.00,
                'is_available': True
            }
        )
        if created:
            print(f"Created seat: {workspace.name}")

print("Seeding complete.")
