from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardView, BookSeatView, AdminWorkspaceViewSet, AdminPlanViewSet, PublicPlanListView, PublicWorkspaceListView

router = DefaultRouter()
router.register(r'admin-workspaces', AdminWorkspaceViewSet, basename='admin-workspace')
router.register(r'admin-plans', AdminPlanViewSet, basename='admin-plan')

urlpatterns = [
    path('', include(router.urls)),
    path('my-dashboard/', DashboardView.as_view(), name='my-dashboard'),
    path('book/', BookSeatView.as_view(), name='book-seat'),
    path('public-plans/', PublicPlanListView.as_view(), name='public-plans'),
    path('public-workspaces/', PublicWorkspaceListView.as_view(), name='public-workspaces'),
]
