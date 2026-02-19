from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError # 👈 Import this
from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 1. Superuser sees everything (Optional: Good for debugging)
        if self.request.user.is_superuser:
            return Property.objects.all().order_by('-created_at')

        # 2. SaaS Filter: Only show User's Organization Data
        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            return Property.objects.filter(organization=user.organization).order_by('-created_at')
        
        return Property.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        
        # 👇 SAFETY CHECK: Ensure user has an organization before saving
        if not hasattr(user, 'organization') or not user.organization:
            raise ValidationError({"detail": "You must belong to an Organization to create properties."})
            
        serializer.save(organization=user.organization)


class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 1. Superuser sees everything
        if self.request.user.is_superuser:
            return Unit.objects.all().order_by('unit_number')

        # 2. SaaS Filter
        user = self.request.user
        if not hasattr(user, 'organization') or not user.organization:
            return Unit.objects.none()

        queryset = Unit.objects.filter(property__organization=user.organization).order_by('unit_number')
        
        # 3. Optional Filter by Property ID
        property_id = self.request.query_params.get('property_id')
        if property_id:
            queryset = queryset.filter(property_id=property_id)
            
        return queryset

    def perform_create(self, serializer):
        # 👇 CRITICAL SECURITY: Prevent adding units to other companies' buildings
        property_instance = serializer.validated_data.get('property')
        user_org = self.request.user.organization
        
        if property_instance.organization != user_org:
            raise ValidationError({"detail": "You cannot add units to a property you do not own."})
            
        serializer.save()