from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardView, BookSeatView, AdminWorkspaceViewSet, AdminPlanViewSet, PublicPlanListView, PublicWorkspaceListView, AdminDetailedUserListView, AdminUserDetailView, ContactMessageCreateView, CreateRazorpayOrderView, VerifyRazorpayPaymentView, BookingDetailView, AdminContactMessageViewSet

router = DefaultRouter()
router.register(r'admin-workspaces', AdminWorkspaceViewSet, basename='admin-workspace')
router.register(r'admin-plans', AdminPlanViewSet, basename='admin-plan')
router.register(r'admin-contact', AdminContactMessageViewSet, basename='admin-contact')

urlpatterns = [
    path('', include(router.urls)),
    path('my-dashboard/', DashboardView.as_view(), name='my-dashboard'),
    path('book/', BookSeatView.as_view(), name='book-seat'),
    path('public-plans/', PublicPlanListView.as_view(), name='public-plans'),
    path('public-workspaces/', PublicWorkspaceListView.as_view(), name='public-workspaces'),
    path('admin/detailed-users/', AdminDetailedUserListView.as_view(), name='admin-detailed-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message'),
    path('create-razorpay-order/', CreateRazorpayOrderView.as_view(), name='create-razorpay-order'),
    path('verify-razorpay-payment/', VerifyRazorpayPaymentView.as_view(), name='verify-razorpay-payment'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
]
