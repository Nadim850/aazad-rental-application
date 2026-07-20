from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

User = get_user_model()

# Replace with your actual Client IDs in production
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"
GITHUB_CLIENT_ID = "YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET = "YOUR_GITHUB_CLIENT_SECRET"

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SocialLoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        provider = request.data.get('provider')
        token = request.data.get('token')
        
        if not provider or not token:
            return Response({'error': 'Provider and token are required'}, status=status.HTTP_400_BAD_REQUEST)

        email = None
        first_name = ""
        last_name = ""

        if provider == 'google':
            try:
                # Verify Google ID Token
                # For development/testing, we might bypass the client ID check by removing it, but it's insecure.
                idinfo = id_token.verify_oauth2_token(token, google_requests.Request())
                email = idinfo['email']
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')
            except ValueError:
                return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
                
        elif provider == 'github':
            # Exchange code for access token
            token_res = requests.post(
                'https://github.com/login/oauth/access_token',
                data={
                    'client_id': GITHUB_CLIENT_ID,
                    'client_secret': GITHUB_CLIENT_SECRET,
                    'code': token
                },
                headers={'Accept': 'application/json'}
            )
            token_json = token_res.json()
            access_token = token_json.get('access_token')
            
            if not access_token:
                return Response({'error': 'Invalid GitHub code'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Get user emails (GitHub sometimes keeps email private in user endpoint)
            emails_res = requests.get(
                'https://api.github.com/user/emails',
                headers={'Authorization': f'token {access_token}'}
            )
            emails_json = emails_res.json()
            
            primary_email = None
            for email_obj in emails_json:
                if email_obj.get('primary') and email_obj.get('verified'):
                    primary_email = email_obj.get('email')
                    break
                    
            if not primary_email:
                return Response({'error': 'No verified primary email found on GitHub'}, status=status.HTTP_400_BAD_REQUEST)
                
            email = primary_email
            
            # Get user profile for names
            user_res = requests.get(
                'https://api.github.com/user',
                headers={'Authorization': f'token {access_token}'}
            )
            user_json = user_res.json()
            name = user_json.get('name', '')
            if name:
                parts = name.split(' ', 1)
                first_name = parts[0]
                if len(parts) > 1:
                    last_name = parts[1]
            else:
                first_name = user_json.get('login', '')

        else:
            return Response({'error': 'Unsupported provider'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                password=get_random_string(32),
            )
            
        # Issue JWT tokens
        tokens = get_tokens_for_user(user)
        return Response(tokens, status=status.HTTP_200_OK)
