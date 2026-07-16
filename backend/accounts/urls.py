from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, CurrentUserView, AdminUserListView,
    NotificationListView, NotificationUpdateView, NotificationDeleteView, NotificationReadAllView, UpdatePreferencesView
)
from .social_views import SocialLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('social-login/', SocialLoginView.as_view(), name='social_login'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('users/', AdminUserListView.as_view(), name='admin_user_list'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/read/', NotificationUpdateView.as_view(), name='notification_read'),
    path('notifications/read-all/', NotificationReadAllView.as_view(), name='notification_read_all'),
    path('notifications/<int:pk>/delete/', NotificationDeleteView.as_view(), name='notification_delete'),
    
    # Preferences
    path('preferences/', UpdatePreferencesView.as_view(), name='update_preferences'),
]
