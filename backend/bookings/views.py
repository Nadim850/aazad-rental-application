from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Booking, Workspace
from .serializers import BookingSerializer
from django.utils import timezone
from datetime import timedelta
import calendar

class DashboardView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        now = timezone.now()
        
        # Get all user bookings ordered by newest first
        all_bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
        
        # Mark expired bookings automatically before returning data
        expired_bookings = all_bookings.filter(status='ACTIVE', end_time__lte=now)
        for b in expired_bookings:
            b.status = 'EXPIRED'
            b.save()
            # Only free the workspace if there are no other active or upcoming bookings for it
            has_upcoming = Booking.objects.filter(workspace=b.workspace, status__in=['ACTIVE', 'UPCOMING']).exists()
            if not has_upcoming:
                b.workspace.is_available = True
                b.workspace.save()

        # Automatically activate UPCOMING bookings if their start time has arrived
        upcoming_to_active = all_bookings.filter(status='UPCOMING', start_time__lte=now)
        for b in upcoming_to_active:
            b.status = 'ACTIVE'
            b.save()
            
        # Refetch after updates
        all_bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
        
        # Active subscription: the latest booking where status='ACTIVE'
        active_booking = all_bookings.filter(status='ACTIVE', end_time__gt=now).first()
        
        # Upcoming subscriptions
        upcoming_bookings = all_bookings.filter(status='UPCOMING')
        
        # History: upgraded, cancelled, or expired bookings
        history_bookings = all_bookings.exclude(status__in=['ACTIVE', 'UPCOMING'])
        
        # Invoices: paid bookings
        paid_bookings = all_bookings.filter(is_paid=True)
        
        return Response({
            'active_subscription': BookingSerializer(active_booking).data if active_booking else None,
            'upcoming_subscriptions': BookingSerializer(upcoming_bookings, many=True).data,
            'subscription_history': BookingSerializer(history_bookings, many=True).data,
            'payment_history': BookingSerializer(paid_bookings, many=True).data
        })

class BookSeatView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        seat_id = request.data.get('seat_id')
        plan_type = request.data.get('plan_type', 'Premium Plan')
        months = int(request.data.get('months', 1))
        
        if not seat_id:
            return Response({'error': 'seat_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # 1. Get Workspace
        # Ensure the seat exists
        try:
            workspace = Workspace.objects.get(name=seat_id)
        except Workspace.DoesNotExist:
            return Response({'error': f'Seat {seat_id} does not exist.'}, status=status.HTTP_404_NOT_FOUND)
            
        if not workspace.is_available:
            # Check if this user is the one currently holding the seat
            current_holder_booking = Booking.objects.filter(workspace=workspace, status__in=['ACTIVE', 'UPCOMING']).order_by('-end_time').first()
            if not current_holder_booking or current_holder_booking.user != request.user:
                return Response({'error': f'Seat {seat_id} is currently not available or already booked.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Mark new seat as unavailable immediately
        workspace.is_available = False
        workspace.save()
            
        # 2. Calculate dates
        latest_user_booking = Booking.objects.filter(user=request.user, status__in=['ACTIVE', 'UPCOMING']).order_by('-end_time').first()
        
        if latest_user_booking:
            start_time = latest_user_booking.end_time
            booking_status = 'UPCOMING'
        else:
            start_time = timezone.now()
            booking_status = 'ACTIVE'
        
        # Add 'months' to current date (approximate as 30 days per month)
        # Using timedelta for simplicity, though dateutil.relativedelta is more accurate for exact calendar months
        end_time = start_time + timedelta(days=30 * months)
        
        # 3. Create Booking
        booking = Booking.objects.create(
            user=request.user,
            workspace=workspace,
            start_time=start_time,
            end_time=end_time,
            is_paid=True,
            status=booking_status
        )
        
        return Response({
            'message': 'Booking successful',
            'booking': BookingSerializer(booking).data
        }, status=status.HTTP_201_CREATED)

from rest_framework import viewsets, generics
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import SubscriptionPlan
from .serializers import WorkspaceSerializer, SubscriptionPlanSerializer

class AdminWorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = (IsAdminUser,)

class AdminPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = (IsAdminUser,)

class PublicPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = (AllowAny,)

class PublicWorkspaceListView(generics.ListAPIView):
    queryset = Workspace.objects.all().order_by('id')
    serializer_class = WorkspaceSerializer
    permission_classes = (AllowAny,)
