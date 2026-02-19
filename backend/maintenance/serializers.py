from rest_framework import serializers
from .models import MaintenanceTicket

class MaintenanceTicketSerializer(serializers.ModelSerializer):
    unit_number = serializers.ReadOnlyField(source='unit.unit_number')
    property_name = serializers.ReadOnlyField(source='unit.property.name')
    tenant_name = serializers.ReadOnlyField(source='tenant.name')

    class Meta:
        model = MaintenanceTicket
        fields = [
            'id', 'unit', 'unit_number', 'property_name', 
            'tenant', 'tenant_name', 
            'title', 'description', 'priority', 'status', 'image', 
            'source', 'created_at' # 👈 ADDED 'source' HERE
        ]