from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, CurrentUserView, AdminUserListView
from .social_views import SocialLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('social-login/', SocialLoginView.as_view(), name='social_login'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('users/', AdminUserListView.as_view(), name='admin_users'),
]
