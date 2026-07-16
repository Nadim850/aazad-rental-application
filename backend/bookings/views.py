from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Booking, Workspace
from .serializers import BookingSerializer
from django.utils import timezone
from datetime import timedelta
from core.notifications import send_notification
import calendar
import razorpay
from django.conf import settings

try:
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception:
    razorpay_client = None

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

from accounts.models import User

class AdminDetailedUserListView(APIView):
    permission_classes = (IsAdminUser,)

    def get(self, request):
        users = User.objects.all().prefetch_related('bookings__workspace')
        detailed_users = []
        now = timezone.now()
        
        for user in users:
            # Evaluate the prefetch
            bookings = list(user.bookings.all())
            
            # Active subscription
            active_list = [b for b in bookings if b.status == 'ACTIVE' and b.end_time > now]
            # Get latest created if multiple exist
            active_list.sort(key=lambda x: x.created_at, reverse=True)
            active = active_list[0] if active_list else None
            
            # Upcoming subscriptions
            upcoming = [b for b in bookings if b.status == 'UPCOMING']
            
            # Payment history (paid bookings)
            payments = [b for b in bookings if b.is_paid]
            payments.sort(key=lambda x: x.created_at, reverse=True)
            
            detailed_users.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'date_joined': user.date_joined,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'active_subscription': BookingSerializer(active).data if active else None,
                'upcoming_subscriptions': BookingSerializer(upcoming, many=True).data,
                'payment_history': BookingSerializer(payments, many=True).data
            })
            
        return Response(detailed_users)

class AdminUserDetailView(APIView):
    permission_classes = (IsAdminUser,)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Prevent deleting superuser if it's the last one, or just prevent deleting yourself
            if user == request.user:
                return Response({'error': 'Cannot delete yourself.'}, status=status.HTTP_400_BAD_REQUEST)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

from .serializers import ContactMessageSerializer

class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = (AllowAny,)

    def perform_create(self, serializer):
        message = serializer.save()
        if self.request.user.is_authenticated:
            send_notification(
                user=self.request.user,
                title="Contact Inquiry Received",
                message="We have received your message and will get back to you shortly.",
                notification_type="contact"
            )

class CreateRazorpayOrderView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        seat_id = request.data.get('seat_id')
        plan_type = request.data.get('plan_type', 'Premium Plan')
        months = int(request.data.get('months', 1))

        if not seat_id:
            return Response({'error': 'seat_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            workspace = Workspace.objects.get(name=seat_id)
        except Workspace.DoesNotExist:
            return Response({'error': f'Seat {seat_id} does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        if not workspace.is_available:
            current_holder_booking = Booking.objects.filter(workspace=workspace, status__in=['ACTIVE', 'UPCOMING']).order_by('-end_time').first()
            if not current_holder_booking or current_holder_booking.user != request.user:
                return Response({'error': f'Seat {seat_id} is currently not available or already booked.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get Plan price
        try:
            plan = SubscriptionPlan.objects.get(name=plan_type)
            amount = float(plan.monthly_price) * months
        except SubscriptionPlan.DoesNotExist:
            # Fallback
            amount = 1999 * months

        if not razorpay_client:
            return Response({'error': 'Razorpay client not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            razorpay_order = razorpay_client.order.create(dict(amount=int(amount * 100), currency='INR', payment_capture='0'))
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'order_id': razorpay_order['id'],
            'amount': razorpay_order['amount'],
            'currency': razorpay_order['currency'],
            'key_id': settings.RAZORPAY_KEY_ID
        })

class VerifyRazorpayPaymentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        seat_id = request.data.get('seat_id')
        plan_type = request.data.get('plan_type', 'Premium Plan')
        months = int(request.data.get('months', 1))

        if not razorpay_client:
            return Response({'error': 'Razorpay client not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Verify signature
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Payment verification failed'}, status=status.HTTP_400_BAD_REQUEST)

        # If verified, create booking
        try:
            workspace = Workspace.objects.get(name=seat_id)
        except Workspace.DoesNotExist:
            return Response({'error': f'Seat {seat_id} does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        # Mark seat unavailable
        workspace.is_available = False
        workspace.save()

        # Calculate dates
        latest_user_booking = Booking.objects.filter(user=request.user, status__in=['ACTIVE', 'UPCOMING']).order_by('-end_time').first()
        
        if latest_user_booking:
            start_time = latest_user_booking.end_time
            booking_status = 'UPCOMING'
        else:
            start_time = timezone.now()
            booking_status = 'ACTIVE'

        end_time = start_time + timedelta(days=30 * months)

        # Get Plan price for amount_paid
        try:
            plan = SubscriptionPlan.objects.get(name=plan_type)
            amount_paid = float(plan.monthly_price) * months
        except SubscriptionPlan.DoesNotExist:
            amount_paid = 1999 * months

        booking = Booking.objects.create(
            user=request.user,
            workspace=workspace,
            start_time=start_time,
            end_time=end_time,
            is_paid=True,
            status=booking_status,
            amount_paid=amount_paid,
            plan_name=plan_type,
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature
        )

        send_notification(
            user=request.user,
            title="Payment Successful",
            message=f"Your payment of ₹{amount_paid} for {plan_type} was successful.",
            notification_type="payment",
            action_url=f"/receipt/{booking.id}"
        )

        return Response({
            'message': 'Payment successful and booking created',
            'booking': BookingSerializer(booking).data
        }, status=status.HTTP_201_CREATED)

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        # Only allow users to view their own bookings, unless they are admin
        if self.request.user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)
