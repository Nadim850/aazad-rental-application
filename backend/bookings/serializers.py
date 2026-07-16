from rest_framework import serializers
from .models import Workspace, Booking, SubscriptionPlan, ContactMessage

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = '__all__'

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    workspace = WorkspaceSerializer(read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'workspace', 'start_time', 'end_time', 'is_paid', 
            'status', 'created_at', 'updated_at', 'amount_paid', 'plan_name', 
            'razorpay_payment_id', 'user_first_name', 'user_last_name', 'user_email'
        ]

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'