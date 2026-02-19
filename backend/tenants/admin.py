from django.contrib import admin
from .models import Tenant, Lease

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'nationality', 'ejari_number', 'created_at')
    search_fields = ('name', 'email', 'phone', 'emirates_id')
    list_filter = ('nationality',)

@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'unit', 'start_date', 'end_date', 'rent_amount', 'payment_frequency', 'is_active')
    list_filter = ('is_active', 'payment_frequency')
    search_fields = ('tenant__name', 'unit__unit_number')
    list_editable = ('is_active',)