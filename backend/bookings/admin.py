from django.contrib import admin
from .models import Workspace, Booking

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace_type', 'price_per_hour', 'is_available')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'workspace', 'start_time', 'end_time', 'is_paid')