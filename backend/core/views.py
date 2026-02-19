from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum 

# Import Models
from properties.models import Property, Unit
from tenants.models import Tenant
from finance.models import Cheque
from maintenance.models import MaintenanceTicket
from .serializers import MyTokenObtainPairSerializer

# 1. Custom Login View
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# 2. Dashboard Stats View
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    🔧 FIX #4: Now filters by organization for SaaS security.
    """
    user = request.user
    
    # --- Determine scope ---
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

    # --- Property Stats ---
    total_properties = properties.count()
    total_units = units.count()
    occupied_units = units.filter(status='OCCUPIED').count()
    vacant_units = units.filter(status='VACANT').count()
    
    occupancy_rate = 0
    if total_units > 0:
        occupancy_rate = round((occupied_units / total_units) * 100, 1)

    # --- Finance Stats ---
    pending_cheques_count = cheques.filter(status='PENDING').count()
    pending_data = cheques.filter(status='PENDING').aggregate(Sum('amount'))
    total_pending_amount = pending_data['amount__sum'] or 0

    revenue_data = cheques.filter(status='CLEARED').aggregate(Sum('amount'))
    total_revenue = revenue_data['amount__sum'] or 0

    bounced_data = cheques.filter(status='BOUNCED').aggregate(Sum('amount'))
    bounced_count = cheques.filter(status='BOUNCED').count()
    bounced_amount = bounced_data['amount__sum'] or 0

    # --- Maintenance Stats ---
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