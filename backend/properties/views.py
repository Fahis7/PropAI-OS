from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer
from .ai_pricing import analyze_rent_price
from communication.models import Inquiry, Notification
from core.models import User


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def smart_pricing(request, unit_id):
    user = request.user
    try:
        if user.is_superuser:
            unit = Unit.objects.get(id=unit_id)
        elif hasattr(user, 'organization') and user.organization:
            unit = Unit.objects.get(id=unit_id, property__organization=user.organization)
        else:
            return Response({"error": "No organization found."}, status=403)
    except Unit.DoesNotExist:
        return Response({"error": "Unit not found or access denied."}, status=404)
    result = analyze_rent_price(unit)
    return Response(result)


# ═══════════════════════════════════════
# PUBLIC ENDPOINTS (No login required)
# ═══════════════════════════════════════

@api_view(['GET'])
@permission_classes([AllowAny])
def public_properties(request):
    """GET /api/public/properties/ — List all properties with vacant unit counts."""
    properties = Property.objects.all()

    data = []
    for p in properties:
        total_units = p.units.count()
        vacant_units = p.units.filter(status='VACANT').count()
        data.append({
            "id": p.id,
            "name": p.name,
            "address": p.address,
            "city": p.city,
            "type": p.get_property_type_display(),
            "description": p.description,
            "image": p.image.url if p.image else None,
            "total_units": total_units,
            "vacant_units": vacant_units,
            "min_rent": float(p.units.order_by('yearly_rent').first().yearly_rent) if p.units.exists() else 0,
            "max_rent": float(p.units.order_by('-yearly_rent').first().yearly_rent) if p.units.exists() else 0,
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_property_detail(request, property_id):
    """GET /api/public/properties/<id>/ — Property details with all vacant units."""
    try:
        p = Property.objects.get(id=property_id)
    except Property.DoesNotExist:
        return Response({"error": "Property not found."}, status=404)

    units = p.units.filter(status='VACANT').order_by('yearly_rent')
    units_data = [
        {
            "id": u.id,
            "unit_number": u.unit_number,
            "unit_type": u.get_unit_type_display(),
            "bedrooms": u.bedrooms,
            "bathrooms": float(u.bathrooms),
            "square_feet": u.square_feet,
            "yearly_rent": float(u.yearly_rent),
            "monthly_rent": round(float(u.yearly_rent) / 12),
            "status": u.status,
        }
        for u in units
    ]

    # Get manager contact if assigned
    manager = User.objects.filter(managed_property=p, role='MANAGER').first()
    manager_info = None
    if manager:
        manager_info = {
            "name": manager.get_full_name() or manager.username,
            "phone": getattr(manager, 'phone', None) or "+971-XX-XXX-XXXX",
        }

    # Get org contact
    org = p.organization
    org_info = {
        "name": org.name,
        "contact_email": org.contact_email if hasattr(org, 'contact_email') else None,
    }

    return Response({
        "id": p.id,
        "name": p.name,
        "address": p.address,
        "city": p.city,
        "type": p.get_property_type_display(),
        "description": p.description,
        "image": p.image.url if p.image else None,
        "rules": p.rules_and_regulations or "",
        "total_units": p.units.count(),
        "vacant_units": units.count(),
        "occupied_units": p.units.filter(status='OCCUPIED').count(),
        "units": units_data,
        "manager": manager_info,
        "organization": org_info,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_inquiry(request):
    """POST /api/public/inquiries/ — Customer submits interest in a unit."""
    name = request.data.get('customer_name', '').strip()
    email = request.data.get('customer_email', '').strip()
    phone = request.data.get('customer_phone', '').strip()
    message = request.data.get('message', '').strip()
    property_id = request.data.get('property_id')
    unit_id = request.data.get('unit_id')

    if not name or not phone or not property_id:
        return Response({"error": "Name, phone, and property are required."}, status=400)

    try:
        prop = Property.objects.get(id=property_id)
    except Property.DoesNotExist:
        return Response({"error": "Property not found."}, status=404)

    unit = None
    if unit_id:
        try:
            unit = Unit.objects.get(id=unit_id, property=prop)
        except Unit.DoesNotExist:
            pass

    inquiry = Inquiry.objects.create(
        property=prop,
        unit=unit,
        customer_name=name,
        customer_email=email,
        customer_phone=phone,
        message=message,
    )

    # Notify managers and owners
    recipients = User.objects.filter(
        organization=prop.organization,
        role__in=['OWNER', 'MANAGER'],
    )
    for user in recipients:
        Notification.objects.create(
            recipient=user,
            notification_type='INQUIRY',
            title=f"🏠 New Inquiry: {name}",
            message=f"{name} ({phone}) is interested in {prop.name}{' — Unit ' + unit.unit_number if unit else ''}. Message: {message or 'No message'}",
        )

    print(f"📩 Inquiry #{inquiry.id} from {name} ({phone}) for {prop.name}")

    return Response({
        "message": "Thank you! Your inquiry has been submitted. Our team will contact you shortly.",
        "inquiry_id": inquiry.id,
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_inquiries(request):
    """GET /api/manager/inquiries/ — Manager sees inquiries for their property."""
    user = request.user
    if user.role == 'MANAGER' and user.managed_property:
        inquiries = Inquiry.objects.filter(property=user.managed_property)
    elif user.role == 'OWNER' and user.organization:
        inquiries = Inquiry.objects.filter(property__organization=user.organization)
    elif user.is_superuser:
        inquiries = Inquiry.objects.all()
    else:
        return Response({"error": "Access denied."}, status=403)

    data = [
        {
            "id": i.id,
            "customer_name": i.customer_name,
            "customer_email": i.customer_email,
            "customer_phone": i.customer_phone,
            "message": i.message,
            "property_name": i.property.name,
            "unit_number": i.unit.unit_number if i.unit else None,
            "unit_id": i.unit.id if i.unit else None,
            "status": i.status,
            "created_at": i.created_at.strftime("%Y-%m-%d %H:%M"),
            "whatsapp_link": f"https://wa.me/{i.customer_phone.replace('+', '').replace('-', '').replace(' ', '')}?text=Hi {i.customer_name}, thank you for your interest in {i.property.name}! We'd love to help you find your perfect home.",
        }
        for i in inquiries[:30]
    ]

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def onboard_tenant(request):
    """
    POST /api/manager/onboard-tenant/
    Creates a tenant account from an inquiry and sends credentials.
    """
    user = request.user
    if user.role not in ['MANAGER', 'OWNER'] and not user.is_superuser:
        return Response({"error": "Access denied."}, status=403)

    inquiry_id = request.data.get('inquiry_id')
    unit_id = request.data.get('unit_id')
    password = request.data.get('password', 'tenant123')

    if not inquiry_id or not unit_id:
        return Response({"error": "inquiry_id and unit_id are required."}, status=400)

    try:
        inquiry = Inquiry.objects.get(id=inquiry_id)
    except Inquiry.DoesNotExist:
        return Response({"error": "Inquiry not found."}, status=404)

    try:
        unit = Unit.objects.get(id=unit_id)
    except Unit.DoesNotExist:
        return Response({"error": "Unit not found."}, status=404)

    # Create user account
    username = inquiry.customer_email or inquiry.customer_phone
    if User.objects.filter(username=username).exists():
        return Response({"error": f"User {username} already exists."}, status=400)

    from tenants.models import Tenant, Lease
    from datetime import date, timedelta

    new_user = User.objects.create_user(
        username=username,
        email=inquiry.customer_email,
        password=password,
        first_name=inquiry.customer_name.split()[0] if inquiry.customer_name else '',
        last_name=' '.join(inquiry.customer_name.split()[1:]) if len(inquiry.customer_name.split()) > 1 else '',
        role='TENANT',
    )

    tenant = Tenant.objects.create(
        user=new_user,
        name=inquiry.customer_name,
        email=inquiry.customer_email,
        phone=inquiry.customer_phone,
    )

    # Create lease
    today = date.today()
    lease = Lease.objects.create(
        tenant=tenant,
        unit=unit,
        start_date=today,
        end_date=today + timedelta(days=365),
        rent_amount=unit.yearly_rent,
        is_active=True,
    )

    # Mark unit as occupied
    unit.status = 'OCCUPIED'
    unit.save()

    # Update inquiry status
    inquiry.status = 'ONBOARDED'
    inquiry.save()

    # Generate WhatsApp message with credentials
    whatsapp_msg = (
        f"Welcome to {unit.property.name}! 🏠\n\n"
        f"Your tenant portal is ready:\n"
        f"🌐 Login: http://localhost:5173/login\n"
        f"👤 Username: {username}\n"
        f"🔑 Password: {password}\n\n"
        f"Unit: {unit.unit_number}\n"
        f"Rent: AED {unit.yearly_rent:,.0f}/year\n\n"
        f"You can view payments, submit maintenance requests, and chat with our AI assistant!"
    )
    phone_clean = inquiry.customer_phone.replace('+', '').replace('-', '').replace(' ', '')
    whatsapp_link = f"https://wa.me/{phone_clean}?text={whatsapp_msg.replace(' ', '%20').replace(chr(10), '%0A')}"

    print(f"✅ Tenant onboarded: {inquiry.customer_name} -> {unit.unit_number}")

    return Response({
        "message": f"Tenant {inquiry.customer_name} onboarded successfully!",
        "username": username,
        "password": password,
        "unit": unit.unit_number,
        "whatsapp_link": whatsapp_link,
    })