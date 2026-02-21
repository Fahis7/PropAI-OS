from rest_framework import serializers
from .models import MaintenanceTicket

class MaintenanceTicketSerializer(serializers.ModelSerializer):
    unit_number = serializers.ReadOnlyField(source='unit.unit_number')
    property_name = serializers.ReadOnlyField(source='unit.property.name')
    property_address = serializers.ReadOnlyField(source='unit.property.address')
    tenant_name = serializers.ReadOnlyField(source='tenant.name')
    tenant_phone = serializers.ReadOnlyField(source='tenant.phone')
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceTicket
        fields = [
            'id', 'unit', 'unit_number', 'property_name', 'property_address',
            'tenant', 'tenant_name', 'tenant_phone',
            'assigned_to', 'assigned_to_name',
            'title', 'description', 'priority', 'status', 'image',
            'source', 'ai_category', 'resolution_notes',
            'created_at', 'updated_at',
        ]

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None