from rest_framework import serializers
from .models import User, Notification
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'phone_number', 'first_name', 'last_name', 'password', 'is_staff', 'is_superuser', 'receive_email_notifications', 'receive_inapp_notifications')
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False}
        }

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', None),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'action_url', 'created_at']
        read_only_fields = ['id', 'title', 'message', 'notification_type', 'action_url', 'created_at']
