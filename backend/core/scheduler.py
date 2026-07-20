from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore
from django.utils import timezone
from datetime import timedelta

def check_expiring_subscriptions():
    from bookings.models import Booking
    from core.notifications import send_notification
    
    # Check for active bookings
    now = timezone.now()
    active_bookings = Booking.objects.filter(status='ACTIVE')
    
    for booking in active_bookings:
        days_left = (booking.end_time - now).days
        
        if days_left == 7:
            send_notification(
                user=booking.user,
                title="Subscription Expiring Soon",
                message=f"Your subscription for {booking.workspace.name} expires in 7 days.",
                notification_type="subscription",
                action_url="/dashboard",
                email_template="generic"
            )
        elif days_left == 3:
            send_notification(
                user=booking.user,
                title="Subscription Expiring in 3 Days",
                message=f"Your subscription for {booking.workspace.name} expires in exactly 3 days. Renew now to keep your seat.",
                notification_type="subscription",
                action_url="/dashboard",
                email_template="generic"
            )
        elif days_left == 1:
            send_notification(
                user=booking.user,
                title="Subscription Expires Tomorrow",
                message=f"Your subscription for {booking.workspace.name} expires tomorrow! Renew immediately to avoid losing access.",
                notification_type="subscription",
                action_url="/dashboard",
                email_template="generic"
            )
        elif days_left <= 0:
            booking.status = 'EXPIRED'
            booking.save()
            
            # If this was the last active/upcoming booking, free up the seat
            if not Booking.objects.filter(workspace=booking.workspace, status__in=['ACTIVE', 'UPCOMING']).exists():
                booking.workspace.is_available = True
                booking.workspace.save()
                
            send_notification(
                user=booking.user,
                title="Subscription Expired",
                message=f"Your subscription for {booking.workspace.name} has expired.",
                notification_type="subscription",
                action_url="/dashboard",
                email_template="generic"
            )

def start():
    scheduler = BackgroundScheduler()
    scheduler.add_jobstore(DjangoJobStore(), "default")
    
    # Run every day at midnight (for testing, we could run every minute but in production daily is correct)
    scheduler.add_job(
        check_expiring_subscriptions,
        'cron',
        hour=0,
        minute=1,
        id='check_expiring_subscriptions',
        replace_existing=True
    )
    
    scheduler.start()
