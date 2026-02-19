from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from dateutil.relativedelta import relativedelta
import datetime
import traceback

from .models import Tenant, Lease
from .serializers import TenantSerializer, LeaseSerializer
from finance.models import Cheque
from properties.serializers import UnitSerializer 

# 👇 IMPORTANT: Add this import to fetch maintenance data
from maintenance.models import MaintenanceTicket

User = get_user_model()

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            tenant = serializer.save()
            user = None
            if not User.objects.filter(username=tenant.email).exists():
                user = User.objects.create_user(
                    username=tenant.email,
                    email=tenant.email,
                    password='tenant123'
                )
                print(f"✅ User account created for {tenant.email}")
            else:
                user = User.objects.get(username=tenant.email)
            
            if user:
                tenant.user = user
                tenant.save()
        except Exception as e:
            print(f"🔥 Error in perform_create: {str(e)}")
            raise e

class LeaseViewSet(viewsets.ModelViewSet):
    queryset = Lease.objects.all()
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        lease = serializer.save()
        unit = lease.unit
        unit.status = 'OCCUPIED'
        unit.save()
        self.generate_cheques(lease)

    def generate_cheques(self, lease):
        frequency_map = {'1_CHEQUE': 1, '4_CHEQUES': 4, '12_CHEQUES': 12}
        num_cheques = frequency_map.get(lease.payment_frequency, 1)
        amount_per_cheque = lease.rent_amount / (num_cheques if num_cheques > 0 else 1)
        months_interval = 12 // num_cheques
        
        for i in range(num_cheques):
            cheque_date = lease.start_date + relativedelta(months=i*months_interval)
            Cheque.objects.create(
                lease=lease,
                tenant=lease.tenant,
                cheque_number=f"AUTO-{lease.id}-{i+1}",
                bank_name="Pending Bank", 
                cheque_date=cheque_date,
                amount=amount_per_cheque,
                status='PENDING'
            )

class MyTenantProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            # 1. Get Tenant by matching logged-in user email
            try:
                tenant = Tenant.objects.get(email=user.email)
            except Tenant.DoesNotExist:
                return Response({"error": "Tenant profile not found"}, status=404)

            # 2. Get Lease
            active_lease = tenant.leases.filter(is_active=True).first()

            # Initialize base data structure
            data = {
                "name": tenant.name,
                "email": tenant.email,
                "phone": tenant.phone,
                "unit": None,
                "lease": None,
                "next_payment": {"amount": 0, "date": "No Pending Payments"},
                "maintenance_tickets": [] # 👈 Required for the AI Tracker list
            }

            if active_lease:
                unit_info = active_lease.unit
                property_name = unit_info.property.name if unit_info.property else "Main Property"
                
                data["unit"] = {
                    "id": unit_info.id, # 👈 Needed so the "Report Issue" form knows which unit
                    "number": unit_info.unit_number,
                    "property": property_name
                }
                data["lease"] = {
                    "start": active_lease.start_date,
                    "end": active_lease.end_date,
                    "rent": active_lease.rent_amount
                }
                
                # Fetch Payments
                cheques = getattr(active_lease, 'payments', None) or getattr(active_lease, 'cheque_set', None)
                if cheques:
                    next_cheque = cheques.filter(status='PENDING').order_by('cheque_date').first()
                    if next_cheque:
                        data["next_payment"] = {
                            "amount": next_cheque.amount,
                            "date": next_cheque.cheque_date
                        }

            # 3. 👇 Fetch Maintenance Requests for this Tenant
            # We fetch the 5 most recent requests to show on the dashboard
            tickets = MaintenanceTicket.objects.filter(tenant=tenant).order_by('-created_at')[:5]
            data["maintenance_tickets"] = [
                {
                    "id": t.id,
                    "title": t.title or "General Maintenance",
                    "priority": t.priority,
                    "ai_category": t.ai_category,
                    "status": t.status,
                    "date": t.created_at.strftime("%Y-%m-%d")
                } for t in tickets
            ]

            return Response(data)

        except Exception as e:
            print("🔥 CRITICAL ERROR IN PROFILE VIEW 🔥")
            traceback.print_exc() 
            return Response({"error": str(e)}, status=500)