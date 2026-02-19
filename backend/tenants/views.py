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
from maintenance.models import MaintenanceTicket

User = get_user_model()

class TenantViewSet(viewsets.ModelViewSet):
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    # 🔧 FIX #6: Removed duplicate user creation from perform_create.
    # User creation is now ONLY handled in TenantSerializer.create()

    def get_queryset(self):
        """🔧 FIX: Add org filtering for SaaS security"""
        user = self.request.user
        if user.is_superuser:
            return Tenant.objects.all().order_by('-created_at')
        
        if hasattr(user, 'organization') and user.organization:
            return Tenant.objects.filter(
                leases__unit__property__organization=user.organization
            ).distinct().order_by('-created_at')
        
        return Tenant.objects.none()


class LeaseViewSet(viewsets.ModelViewSet):
    serializer_class = LeaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """🔧 FIX: Add org filtering for SaaS security"""
        user = self.request.user
        if user.is_superuser:
            return Lease.objects.all().order_by('-start_date')
        
        if hasattr(user, 'organization') and user.organization:
            return Lease.objects.filter(
                unit__property__organization=user.organization
            ).order_by('-start_date')
        
        return Lease.objects.none()

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

        # 🔧 FIX: Include organization from the unit's property
        org = lease.unit.property.organization if lease.unit and lease.unit.property else None
        
        for i in range(num_cheques):
            cheque_date = lease.start_date + relativedelta(months=i*months_interval)
            Cheque.objects.create(
                lease=lease,
                tenant=lease.tenant,
                organization=org,
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
            try:
                tenant = Tenant.objects.get(user=user)
            except Tenant.DoesNotExist:
                try:
                    tenant = Tenant.objects.get(email=user.email)
                except Tenant.DoesNotExist:
                    return Response({"error": "Tenant profile not found"}, status=404)

            active_lease = tenant.leases.filter(is_active=True).first()

            data = {
                "name": tenant.name,
                "email": tenant.email,
                "phone": tenant.phone,
                "unit": None,
                "lease": None,
                "next_payment": {"amount": 0, "date": "No Pending Payments"},
                "maintenance_tickets": []
            }

            if active_lease:
                unit_info = active_lease.unit
                property_name = unit_info.property.name if unit_info.property else "Main Property"
                
                data["unit"] = {
                    "id": unit_info.id,
                    "number": unit_info.unit_number,
                    "property": property_name
                }
                data["lease"] = {
                    "start": active_lease.start_date,
                    "end": active_lease.end_date,
                    "rent": active_lease.rent_amount
                }
                
                # 🔧 FIX #3: Use correct related name 'cheques'
                next_cheque = active_lease.cheques.filter(
                    status='PENDING'
                ).order_by('cheque_date').first()
                
                if next_cheque:
                    data["next_payment"] = {
                        "amount": next_cheque.amount,
                        "date": next_cheque.cheque_date
                    }

            tickets = MaintenanceTicket.objects.filter(tenant=tenant).order_by('-created_at')[:5]
            data["maintenance_tickets"] = [
                {
                    "id": t.id,
                    "title": t.title or "General Maintenance",
                    "priority": t.priority,
                    "category": t.title,  # 🔧 FIX #2: Removed ai_category
                    "status": t.status,
                    "date": t.created_at.strftime("%Y-%m-%d")
                } for t in tickets
            ]

            return Response(data)

        except Exception as e:
            print("🔥 CRITICAL ERROR IN PROFILE VIEW 🔥")
            traceback.print_exc() 
            return Response({"error": str(e)}, status=500)