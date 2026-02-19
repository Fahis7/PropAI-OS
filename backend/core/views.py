from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum 

# Import Models
from properties.models import Property, Unit
from tenants.models import Tenant
from finance.models import Cheque
from .serializers import MyTokenObtainPairSerializer

# 1. Custom Login View
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# 2. Dashboard Stats View
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Returns real-time analytics for the Admin Dashboard.
    Matches the keys expected by AdminDashboard.jsx
    """
    
    # --- Property Stats ---
    total_properties = Property.objects.count()
    total_units = Unit.objects.count()
    occupied_units = Unit.objects.filter(status='OCCUPIED').count()
    vacant_units = Unit.objects.filter(status='VACANT').count()
    
    # Calculate Occupancy % safely
    occupancy_rate = 0
    if total_units > 0:
        occupancy_rate = round((occupied_units / total_units) * 100, 1)

    # --- Finance Stats ---
    
    # 1. Pending (Future Revenue)
    pending_cheques_count = Cheque.objects.filter(status='PENDING').count()
    pending_data = Cheque.objects.filter(status='PENDING').aggregate(Sum('amount'))
    total_pending_amount = pending_data['amount__sum'] or 0

    # 2. Revenue (Cleared Funds)
    revenue_data = Cheque.objects.filter(status='CLEARED').aggregate(Sum('amount'))
    total_revenue = revenue_data['amount__sum'] or 0

    # 3. Bounced (Critical Alerts) 🚨 👇 NEW ADDITION
    bounced_data = Cheque.objects.filter(status='BOUNCED').aggregate(Sum('amount'))
    bounced_count = Cheque.objects.filter(status='BOUNCED').count()
    bounced_amount = bounced_data['amount__sum'] or 0

    return Response({
        'total_properties': total_properties,
        'total_units': total_units,
        'occupied_units': occupied_units,
        'vacant_units': vacant_units,
        'occupancy_rate': occupancy_rate,
        'active_tenants': Tenant.objects.count(),
        
        'pending_cheques': pending_cheques_count,
        'total_pending_amount': total_pending_amount,
        'total_revenue': total_revenue,
        
        # 👇 Send these to the frontend
        'bounced_cheques': bounced_count,
        'bounced_amount': bounced_amount
    })