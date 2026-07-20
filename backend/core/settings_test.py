"""Test settings — SQLite in-memory DB, no external services."""
from core.settings import *  # noqa: F401, F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

RAZORPAY_KEY_ID = 'test_key_id'
RAZORPAY_KEY_SECRET = 'test_key_secret'

# Admin theme not required for API tests
INSTALLED_APPS = [app for app in INSTALLED_APPS if app != 'unfold']
