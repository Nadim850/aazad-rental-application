from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SubscriptionPlan, Workspace

@receiver(post_save, sender=SubscriptionPlan)
def ensure_workspaces_exist(sender, instance, created, **kwargs):
    """
    Ensure that we have 'total_seats' number of Workspace records 
    for this SubscriptionPlan's prefix.
    """
    if not instance.seat_prefix or instance.total_seats <= 0:
        return

    prefix = instance.seat_prefix
    w_type = instance.workspace_type

    for i in range(1, instance.total_seats + 1):
        seat_name = f"{prefix}-{i}"
        
        # Calculate an approximate hourly price just to satisfy the model requirement
        hourly_price = instance.monthly_price / (30 * 8) if instance.monthly_price else 0
        
        Workspace.objects.get_or_create(
            name=seat_name,
            defaults={
                'workspace_type': w_type,
                'price_per_hour': hourly_price,
                'is_available': True
            }
        )
        
    # Delete excess workspaces if total_seats was decreased
    existing_workspaces = Workspace.objects.filter(name__startswith=f"{prefix}-")
    for ws in existing_workspaces:
        try:
            num_part = ws.name.split('-')[1]
            num = int(num_part)
            if num > instance.total_seats:
                ws.delete()
        except (IndexError, ValueError):
            pass
