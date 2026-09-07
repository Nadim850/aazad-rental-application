from rest_framework import response
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
            # Check if this user holds any active/upcoming booking for this workspace
            has_booking = Booking.objects.filter(workspace=workspace, status__in=['ACTIVE', 'UPCOMING'], user=request.user).exists()
            if not has_booking:
                return Response({'error': f'Seat {seat_id} is currently not available or already booked.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Mark new seat as unavailable immediately
        workspace.is_available = False
        workspace.save()
            
        # 2. Calculate dates
        latest_user_booking = Booking.objects.filter(user=request.user, workspace=workspace, status__in=['ACTIVE', 'UPCOMING']).order_by('-end_time').first()
        
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
            
            # Pending subscriptions
            pending = [b for b in bookings if b.status == 'PENDING']
            
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
                'pending_subscriptions': BookingSerializer(pending, many=True).data,
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

class ApproveBookingView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, status='PENDING')
        except Booking.DoesNotExist:
            return Response({'error': 'Pending booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        booking.status = 'ACTIVE' # Or UPCOMING based on start_time, but for simplicity we assume ACTIVE or let the logic calculate it
        booking.is_paid = True
        booking.save()

        # Send notification to user
        send_notification(
            user=booking.user,
            title="Payment Approved",
            message=f"Your payment for {booking.workspace.name} has been approved. Your booking is now confirmed.",
            notification_type="payment",
            action_url=f"/receipt/{booking.id}",
            email_template="generic"
        )

        return Response({'message': 'Booking approved successfully.'})
class RejectBookingView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, status='PENDING')
        except Booking.DoesNotExist:
            return 
        Response({'error': 'Pending booking not found.'}, status=status.HTTP_404_NOT_FOUND)
        # FREE UP THE WORKSPACE AGAIN
        booking.workspace.is_available = True
        booking.workspace.save()
        #MARK BOOKING AS CANCELLED
        booking.status = 'CANCELLED'
        booking.save()
        # Send notification to user
        send_notification(
            user=booking.user,
            title="Payment Rejected",
            message=f"Your payment for {booking.workspace.name} has been rejected. Please contact support for further assistance.",
            notification_type="payment",
            email_template="generic")
        return Response({'message': 'Booking rejected successfully.'})
from .serializers import ContactMessageSerializer
from .models import ContactMessage

class AdminContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = (IsAdminUser,)

class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = (AllowAny,)

    def perform_create(self, serializer):
        message = serializer.save()
        
        # Send an acknowledgment email to the submitter (both authenticated and unauthenticated)
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@aazadrental.com')
            send_mail(
                subject="We received your inquiry - Aazad Rental",
                message=f"Hi {message.name},\n\nThank you for reaching out to us. We have received your query regarding '{message.subject}'. Our team will get back to you shortly.\n\nBest regards,\nAazad Rental Team",
                from_email=from_email,
                recipient_list=[message.email],
                fail_silently=True,
            )
        except Exception as e:
            pass
            
        if self.request.user.is_authenticated:
            send_notification(
                user=self.request.user,
                title="Contact Inquiry Received",
                message="We have received your message and will get back to you shortly.",
                notification_type="contact",
                email_template="generic"
            )
        
        # Notify admins
        admins = User.objects.filter(is_staff=True)
        for admin in admins:
            send_notification(
                user=admin,
                title="New Contact Query",
                message=f"A new query from {message.name} has been received.",
                notification_type="contact",
                email_template="generic"
            )

class CreateManualBookingView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        seat_id = request.data.get('seat_id')
        plan_type = request.data.get('plan_type', 'Premium Plan')
        months = int(request.data.get('months', 1))
        transaction_id = request.data.get('transaction_id')

        if not seat_id:
            return Response({'error': 'seat_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not transaction_id:
            return Response({'error': 'transaction_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            workspace = Workspace.objects.get(name=seat_id)
        except Workspace.DoesNotExist:
            return Response({'error': f'Seat {seat_id} does not exist.'}, status=status.HTTP_404_NOT_FOUND)

        # Get Plan price
        try:
            plan = SubscriptionPlan.objects.get(name=plan_type)
            if months == 3 and plan.price_3_months:
                amount = float(plan.price_3_months)
            elif months == 6 and plan.price_6_months:
                amount = float(plan.price_6_months)
            elif months == 12 and plan.price_1_year:
                amount = float(plan.price_1_year)
            else:
                amount = float(plan.monthly_price) * months
        except SubscriptionPlan.DoesNotExist:
            # Fallback
            amount = 1999 * months

        # Mark seat unavailable temporarily
        workspace.is_available = False
        workspace.save()

        # Calculate dates
        latest_user_booking = Booking.objects.filter(user=request.user, workspace=workspace, status__in=['ACTIVE', 'UPCOMING']).order_by('-end_time').first()
        
        if latest_user_booking:
            start_time = latest_user_booking.end_time
        else:
            start_time = timezone.now()
            
        # Standardize duration logic
        if months == 1:
            end_time = start_time + timedelta(days=30)
        elif months == 3:
            end_time = start_time + timedelta(days=90)
        elif months == 6:
            end_time = start_time + timedelta(days=180)
        elif months == 12:
            end_time = start_time + timedelta(days=365)
        else:
            end_time = start_time + timedelta(days=30 * months)

        booking = Booking.objects.create(
            user=request.user,
            workspace=workspace,
            start_time=start_time,
            end_time=end_time,
            is_paid=False,
            amount_paid=amount,
            plan_name=plan_type,
            status='PENDING',
            transaction_id=transaction_id
        )

        send_notification(
            user=request.user,
            title="Booking Pending Approval",
            message=f"Your booking for {workspace.name} is pending admin approval.",
            notification_type="payment",
            email_template="generic"
        )
        
        # Notify admins
        admins = User.objects.filter(is_staff=True)
        for admin in admins:
            send_notification(
                user=admin,
                title="New Payment Approval Required",
                message=f"User {request.user.email} submitted payment for {workspace.name}.",
                notification_type="payment",
                email_template="generic"
            )

        return Response({
            'message': 'Booking created successfully and is pending approval.',
            'booking_id': booking.id
        })

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        # Only allow users to view their own bookings, unless they are admin
        if self.request.user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)
