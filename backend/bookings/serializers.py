from rest_framework import serializers
from .models import Workspace, Booking, SubscriptionPlan

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
    
    class Meta:
        model = Booking
        fields = ['id', 'workspace', 'start_time', 'end_time', 'is_paid', 'status', 'created_at', 'updated_at']