from rest_framework import serializers
from .models import Property, Unit

class PropertySerializer(serializers.ModelSerializer):
    total_units = serializers.IntegerField(source='units.count', read_only=True)
    vacant_units = serializers.SerializerMethodField()
    occupied_units = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'name', 'address', 'city', 'property_type', 'description',  # 🔧 FIX #15: Added description
            'image', 'total_units', 'vacant_units', 'occupied_units', 'created_at'
        ]

    def get_vacant_units(self, obj):
        return obj.units.filter(status='VACANT').count()

    def get_occupied_units(self, obj):
        return obj.units.filter(status='OCCUPIED').count()

class UnitSerializer(serializers.ModelSerializer):
    property_details = PropertySerializer(source='property', read_only=True)
    property_name = serializers.CharField(source='property.name', read_only=True)

    class Meta:
        model = Unit
        fields = [
            'id', 'property', 'property_details', 'property_name', 
            'unit_number', 'unit_type',
            'yearly_rent', 'bedrooms', 'bathrooms', 'square_feet', 'status'
        ]