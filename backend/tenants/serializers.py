from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tenant, Lease
from properties.serializers import UnitSerializer

User = get_user_model()

class LeaseSerializer(serializers.ModelSerializer):
    unit_details = UnitSerializer(source='unit', read_only=True)

    class Meta:
        model = Lease
        fields = '__all__'

class TenantSerializer(serializers.ModelSerializer):
    active_lease = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def get_active_lease(self, obj):
        lease = obj.leases.filter(is_active=True).first()
        if lease:
            return LeaseSerializer(lease).data
        return None

    def create(self, validated_data):
        """
        🔧 FIX #6: Single place for User creation.
        🔧 FIX #10: Sets role to TENANT so JWT routing works correctly.
        """
        email = validated_data.get('email')
        name = validated_data.get('name')

        # 1. Create (or Fetch) the User Login
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
        else:
            user = User.objects.create_user(
                username=email, 
                email=email, 
                first_name=name,
                role='TENANT',  # 🔧 FIX: Set role so JWT token contains correct role
            )
            user.set_password("tenant123") 
            user.save()

        # 2. Create the Tenant Profile
        tenant = Tenant.objects.create(user=user, **validated_data)
        return tenant