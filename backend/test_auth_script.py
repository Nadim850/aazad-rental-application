import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
User = get_user_model()
client = APIClient()

print("--- Testing Registration ---")
response = client.post('/api/accounts/register/', {
    'phone_number': '1234567890',
    'password': 'SecurePassword123!',
    'first_name': 'Test',
    'last_name': 'User'
})
print(f"Register status: {response.status_code}")
if response.status_code == 201:
    print("Registration Successful!")
else:
    print(f"Registration Failed: {response.data}")

print("\n--- Testing Login ---")
response = client.post('/api/accounts/login/', {
    'phone_number': '1234567890',
    'password': 'SecurePassword123!'
})
print(f"Login status: {response.status_code}")
if response.status_code == 200:
    print("Login Successful!")
    print(f"Access Token: {response.data.get('access')[:20]}...")
else:
    print(f"Login Failed: {response.data}")
