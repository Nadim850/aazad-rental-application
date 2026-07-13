from django.db import models
from django.conf import settings

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    workspace_type = models.CharField(max_length=100)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='bookings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_paid = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} for {self.workspace.name} by {self.user}"
