import threading
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import Notification
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def _send_email_thread(subject, html_message, plain_message, recipient_list):
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=True  # Important: prevent app crashes if SMTP is not configured
        )
    except Exception as e:
        print(f"Error sending email: {e}")

def send_email_notification_async(user, subject, template_name, context):
    """
    Sends an email notification asynchronously if the user has opted in.
    """
    if not getattr(user, 'receive_email_notifications', True):
        return

    # Add standard context
    context['user'] = user
    context['frontend_url'] = 'http://localhost:5173' # Hardcoded for now, could be setting

    # We will use simple HTML templates or fallback to string formatting
    try:
        html_message = render_to_string(f'emails/{template_name}.html', context)
        plain_message = strip_tags(html_message)
    except Exception:
        # Fallback if template doesn't exist
        html_message = f"<h2>{subject}</h2><p>{context.get('message', '')}</p>"
        plain_message = f"{subject}\n\n{context.get('message', '')}"

    thread = threading.Thread(
        target=_send_email_thread, 
        args=(subject, html_message, plain_message, [user.email])
    )
    thread.start()

def send_inapp_notification(user, title, message, notification_type, action_url=None):
    """
    Creates an in-app notification if the user has opted in.
    """
    if not getattr(user, 'receive_inapp_notifications', True):
        return None

    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        action_url=action_url
    )
    return notification

def send_notification(user, title, message, notification_type, action_url=None, email_template=None, email_context=None):
    """
    Convenience method to dispatch both email and in-app notifications.
    """
    send_inapp_notification(user, title, message, notification_type, action_url)
    
    if email_template:
        context = email_context or {'message': message}
        send_email_notification_async(user, title, email_template, context)
