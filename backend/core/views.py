from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum, Count, Q

from properties.models import Property, Unit
from tenants.models import Tenant
from finance.models import Cheque
from maintenance.models import MaintenanceTicket
from core.models import User
from .serializers import MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    if user.is_superuser:
        properties = Property.objects.all()
        units = Unit.objects.all()
        cheques = Cheque.objects.all()
        tenants = Tenant.objects.all()
        tickets = MaintenanceTicket.objects.all()
    elif hasattr(user, 'organization') and user.organization:
        org = user.organization
        properties = Property.objects.filter(organization=org)
        units = Unit.objects.filter(property__organization=org)
        cheques = Cheque.objects.filter(organization=org)
        tenants = Tenant.objects.filter(leases__unit__property__organization=org).distinct()
        tickets = MaintenanceTicket.objects.filter(organization=org)
    else:
        return Response({
            'total_properties': 0, 'total_units': 0, 'occupied_units': 0,
            'vacant_units': 0, 'occupancy_rate': 0, 'active_tenants': 0,
            'pending_cheques': 0, 'total_pending_amount': 0, 'total_revenue': 0,
            'bounced_cheques': 0, 'bounced_amount': 0,
            'open_tickets': 0, 'emergency_tickets': 0,
        })

    total_properties = properties.count()
    total_units = units.count()
    occupied_units = units.filter(status='OCCUPIED').count()
    vacant_units = units.filter(status='VACANT').count()
    
    occupancy_rate = 0
    if total_units > 0:
        occupancy_rate = round((occupied_units / total_units) * 100, 1)

    pending_cheques_count = cheques.filter(status='PENDING').count()
    pending_data = cheques.filter(status='PENDING').aggregate(Sum('amount'))
    total_pending_amount = pending_data['amount__sum'] or 0

    revenue_data = cheques.filter(status='CLEARED').aggregate(Sum('amount'))
    total_revenue = revenue_data['amount__sum'] or 0

    bounced_data = cheques.filter(status='BOUNCED').aggregate(Sum('amount'))
    bounced_count = cheques.filter(status='BOUNCED').count()
    bounced_amount = bounced_data['amount__sum'] or 0

    open_tickets = tickets.filter(status='OPEN').count()
    emergency_tickets = tickets.filter(priority='EMERGENCY', status__in=['OPEN', 'IN_PROGRESS']).count()

    return Response({
        'total_properties': total_properties,
        'total_units': total_units,
        'occupied_units': occupied_units,
        'vacant_units': vacant_units,
        'occupancy_rate': occupancy_rate,
        'active_tenants': tenants.count(),
        'pending_cheques': pending_cheques_count,
        'total_pending_amount': total_pending_amount,
        'total_revenue': total_revenue,
        'bounced_cheques': bounced_count,
        'bounced_amount': bounced_amount,
        'open_tickets': open_tickets,
        'emergency_tickets': emergency_tickets,
    })


# 🆕 Manager Dashboard Stats — scoped to their assigned property
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_stats(request):
    user = request.user

    if user.role != 'MANAGER' and not user.is_superuser:
        return Response({"error": "Not a manager."}, status=403)

    prop = user.managed_property
    if not prop:
        return Response({"error": "No property assigned to this manager."}, status=404)

    units = prop.units.all()
    total_units = units.count()
    occupied = units.filter(status='OCCUPIED').count()
    vacant = units.filter(status='VACANT').count()
    occupancy_rate = round((occupied / total_units * 100), 1) if total_units > 0 else 0

    tickets = MaintenanceTicket.objects.filter(unit__property=prop)
    open_tickets = tickets.filter(status='OPEN').count()
    in_progress = tickets.filter(status='IN_PROGRESS').count()
    emergency = tickets.filter(priority='EMERGENCY', status__in=['OPEN', 'IN_PROGRESS']).count()

    cheques = Cheque.objects.filter(lease__unit__property=prop)
    pending_amount = cheques.filter(status='PENDING').aggregate(Sum('amount'))['amount__sum'] or 0
    revenue = cheques.filter(status='CLEARED').aggregate(Sum('amount'))['amount__sum'] or 0
    bounced = cheques.filter(status='BOUNCED').count()

    tenants = Tenant.objects.filter(leases__unit__property=prop, leases__is_active=True).distinct()

    # Technician workload
    org = prop.organization
    technicians = User.objects.filter(
        role='MAINTENANCE', organization=org
    ).annotate(
        active_count=Count('assigned_tickets', filter=Q(
            assigned_tickets__status__in=['OPEN', 'IN_PROGRESS']
        )),
        total_count=Count('assigned_tickets'),
    )

    tech_list = [
        {
            "id": t.id,
            "name": t.get_full_name() or t.username,
            "specialty": t.specialty,
            "active_tickets": t.active_count,
            "total_tickets": t.total_count,
        }
        for t in technicians
    ]

    # Recent tickets
    recent_tickets = [
        {
            "id": t.id,
            "title": t.title,
            "unit_number": t.unit.unit_number,
            "priority": t.priority,
            "status": t.status,
            "ai_category": t.ai_category,
            "assigned_to": t.assigned_to.get_full_name() if t.assigned_to else None,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for t in tickets.order_by('-created_at')[:15]
    ]

    # Units list
    units_list = [
        {
            "id": u.id,
            "unit_number": u.unit_number,
            "unit_type": u.get_unit_type_display(),
            "status": u.status,
            "yearly_rent": float(u.yearly_rent),
        }
        for u in units
    ]

    # Tenants list
    tenants_list = [
        {
            "id": t.id,
            "name": t.name,
            "phone": t.phone,
            "email": t.email,
            "unit": t.leases.filter(is_active=True).first().unit.unit_number if t.leases.filter(is_active=True).exists() else "N/A",
        }
        for t in tenants
    ]

    return Response({
        "property": {
            "id": prop.id,
            "name": prop.name,
            "address": prop.address,
            "type": prop.get_property_type_display(),
            "rules": prop.rules_and_regulations or "",
        },
        "stats": {
            "total_units": total_units,
            "occupied": occupied,
            "vacant": vacant,
            "occupancy_rate": occupancy_rate,
            "tenants": tenants.count(),
            "revenue": float(revenue),
            "pending": float(pending_amount),
            "bounced": bounced,
            "open_tickets": open_tickets,
            "in_progress": in_progress,
            "emergency": emergency,
        },
        "technicians": tech_list,
        "recent_tickets": recent_tickets,
        "units": units_list,
        "tenants": tenants_list,
    })


# 🆕 Update property rules
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_property_rules(request, property_id):
    user = request.user

    if user.role not in ['MANAGER', 'OWNER', 'SUPER_ADMIN'] and not user.is_superuser:
        return Response({"error": "Not authorized."}, status=403)

    try:
        if user.is_superuser:
            prop = Property.objects.get(id=property_id)
        elif user.role == 'MANAGER' and user.managed_property and user.managed_property.id == property_id:
            prop = user.managed_property
        elif user.role == 'OWNER' and hasattr(user, 'organization') and user.organization:
            prop = Property.objects.get(id=property_id, organization=user.organization)
        else:
            return Response({"error": "Access denied."}, status=403)
    except Property.DoesNotExist:
        return Response({"error": "Property not found."}, status=404)

    rules = request.data.get('rules_and_regulations', '')
    prop.rules_and_regulations = rules
    prop.save()

    print(f"📋 Rules updated for {prop.name} by {user.username}")

    return Response({"message": "Rules updated successfully.", "rules": prop.rules_and_regulations})