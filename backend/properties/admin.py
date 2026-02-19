from django.contrib import admin
from .models import Property, Unit

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'city', 'property_type', 'created_at')
    list_filter = ('property_type', 'city', 'organization')
    search_fields = ('name', 'address')

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('unit_number', 'property', 'unit_type', 'status', 'yearly_rent')
    list_filter = ('status', 'unit_type', 'property')
    search_fields = ('unit_number',)
    list_editable = ('status',)