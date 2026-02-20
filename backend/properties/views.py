from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer
from .ai_pricing import analyze_rent_price


class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Property.objects.all().order_by('-created_at')

        user = self.request.user
        if hasattr(user, 'organization') and user.organization:
            return Property.objects.filter(organization=user.organization).order_by('-created_at')
        
        return Property.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'organization') or not user.organization:
            raise ValidationError({"detail": "You must belong to an Organization to create properties."})
        serializer.save(organization=user.organization)


class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Unit.objects.all().order_by('unit_number')

        user = self.request.user
        if not hasattr(user, 'organization') or not user.organization:
            return Unit.objects.none()

        queryset = Unit.objects.filter(property__organization=user.organization).order_by('unit_number')
        
        property_id = self.request.query_params.get('property_id')
        if property_id:
            queryset = queryset.filter(property_id=property_id)
            
        return queryset

    def perform_create(self, serializer):
        property_instance = serializer.validated_data.get('property')
        user_org = self.request.user.organization
        
        if property_instance.organization != user_org:
            raise ValidationError({"detail": "You cannot add units to a property you do not own."})
            
        serializer.save()


# 🆕 Smart Rent Pricing Endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def smart_pricing(request, unit_id):
    """
    Phase 3: Smart Rent Pricing Engine
    GET /api/units/<unit_id>/smart-pricing/
    Returns AI-powered rent recommendation for a unit.
    """
    user = request.user

    # Security: ensure user can only price their own units
    try:
        if user.is_superuser:
            unit = Unit.objects.get(id=unit_id)
        elif hasattr(user, 'organization') and user.organization:
            unit = Unit.objects.get(id=unit_id, property__organization=user.organization)
        else:
            return Response({"error": "No organization found."}, status=403)
    except Unit.DoesNotExist:
        return Response({"error": "Unit not found or access denied."}, status=404)

    print(f"🧠 Smart Pricing requested for Unit #{unit.unit_number} ({unit.property.name})")
    
    result = analyze_rent_price(unit)
    
    return Response(result)