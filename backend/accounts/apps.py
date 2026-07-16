from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        import os
        # Avoid running scheduler multiple times (like in runserver auto-reload)
        if os.environ.get('RUN_MAIN') == 'true':
            from core import scheduler
            scheduler.start()
