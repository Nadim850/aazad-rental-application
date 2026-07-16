from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, Notification
from .serializers import UserSerializer, NotificationSerializer
from core.notifications import send_notification

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        send_notification(
            user=user,
            title="Welcome to Aazad Rental!",
            message="Thank you for registering. You can now book your premium workspace.",
            notification_type="auth",
            email_template="welcome",
        )

class CurrentUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAdminUser,)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class NotificationUpdateView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"status": "success"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

class NotificationReadAllView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "success"})

class NotificationDeleteView(generics.DestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class UpdatePreferencesView(APIView):
    permission_classes = (IsAuthenticated,)

    def patch(self, request):
        user = request.user
        receive_email = request.data.get('receive_email_notifications')
        receive_inapp = request.data.get('receive_inapp_notifications')
        
        if receive_email is not None:
            user.receive_email_notifications = receive_email
        if receive_inapp is not None:
            user.receive_inapp_notifications = receive_inapp
            
        user.save()
        return Response({"status": "success"})
