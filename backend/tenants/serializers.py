from rest_framework import serializers
from django.contrib.auth import get_user_model # 👈 CHANGED: Use this helper
from .models import Tenant, Lease
from properties.serializers import UnitSerializer

# Get the correct User model dynamically
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
        email = validated_data.get('email')
        name = validated_data.get('name')

        # 1. Create (or Fetch) the User Login
        if User.objects.filter(email=email).exists(): # Check by email, safer for custom models
            user = User.objects.get(email=email)
        else:
            # We assume your custom user model still uses 'username' or 'email' as identifier
            # Adjust 'username=email' if your custom model DOES NOT have a username field
            user = User.objects.create_user(username=email, email=email, first_name=name)
            user.set_password("tenant123") 
            user.save()

        # 2. Create the Tenant Profile
        tenant = Tenant.objects.create(user=user, **validated_data)
        return tenant