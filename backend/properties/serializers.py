from rest_framework import serializers
from .models import Property, Unit

# 👇 1. MOVE THIS TO THE TOP
class PropertySerializer(serializers.ModelSerializer):
    # Production Magic: These fields are calculated on the fly
    total_units = serializers.IntegerField(source='units.count', read_only=True)
    vacant_units = serializers.SerializerMethodField()
    occupied_units = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'name', 'address', 'city', 'property_type', 
            'image', 'total_units', 'vacant_units', 'occupied_units', 'created_at'
        ]

    def get_vacant_units(self, obj):
        return obj.units.filter(status='VACANT').count()

    def get_occupied_units(self, obj):
        return obj.units.filter(status='OCCUPIED').count()

# 👇 2. UNIT SERIALIZER COMES SECOND
class UnitSerializer(serializers.ModelSerializer):
    # 👇 This gives us the Full Property Object (Name, Address, Image)
    property_details = PropertySerializer(source='property', read_only=True)
    
    # Keep this for simple debugging if you want
    property_name = serializers.CharField(source='property.name', read_only=True)

    class Meta:
        model = Unit
        fields = [
            'id', 'property', 'property_details', 'property_name', 
            'unit_number', 'unit_type',
            'yearly_rent', 'bedrooms', 'bathrooms', 'square_feet', 'status'
        ]