from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Workspace, Booking, SubscriptionPlan

@admin.register(Workspace)
class WorkspaceAdmin(ModelAdmin):
    list_display = ('name', 'workspace_type', 'price_per_hour', 'is_available')

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(ModelAdmin):
    list_display = ('name', 'workspace_type', 'monthly_price', 'is_active')

@admin.register(Booking)
class BookingAdmin(ModelAdmin):
    list_display = ('user', 'workspace', 'start_time', 'end_time', 'is_paid')