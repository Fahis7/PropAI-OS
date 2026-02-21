from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from dateutil.relativedelta import relativedelta
from django.utils import timezone
import datetime
import traceback

from .models import Tenant, Lease
from .serializers import TenantSerializer, LeaseSerializer
from .ejari_generator import generate_ejari_pdf
from finance.models import Cheque
from properties.serializers import UnitSerializer 
from maintenance.models import MaintenanceTicket

User = get_user_model()


class TenantViewSet(viewsets.ModelViewSet):
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
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


# 🆕 Ejari Contract PDF Download
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_ejari(request, lease_id):
    """
    Generate and download an Ejari-style tenancy contract PDF.
    GET /api/leases/<lease_id>/ejari/
    """
    user = request.user

    try:
        if user.is_superuser:
            lease = Lease.objects.get(id=lease_id)
        elif hasattr(user, 'organization') and user.organization:
            lease = Lease.objects.get(id=lease_id, unit__property__organization=user.organization)
        else:
            return Response({"error": "No organization found."}, status=403)
    except Lease.DoesNotExist:
        return Response({"error": "Lease not found or access denied."}, status=404)

    print(f"📄 Generating Ejari contract for Lease #{lease.id} — {lease.tenant.name}")

    pdf_buffer, ejari_number = generate_ejari_pdf(lease)

    filename = f"Ejari_{ejari_number}_{lease.tenant.name.replace(' ', '_')}.pdf"

    response = HttpResponse(pdf_buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


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
                "nationality": tenant.nationality,
                "emirates_id": tenant.emirates_id,
                "ejari_number": tenant.ejari_number,
                "unit": None,
                "lease": None,
                "next_payment": {"amount": 0, "date": "No Pending Payments"},
                "cheques": [],
                "maintenance_tickets": [],
                "notifications": [],
            }

            if active_lease:
                unit_info = active_lease.unit
                property_name = unit_info.property.name if unit_info.property else "Main Property"
                
                data["unit"] = {
                    "id": unit_info.id,
                    "number": unit_info.unit_number,
                    "type": unit_info.unit_type,
                    "property": property_name,
                    "bedrooms": unit_info.bedrooms,
                    "bathrooms": float(unit_info.bathrooms),
                    "square_feet": unit_info.square_feet,
                }
                data["lease"] = {
                    "id": active_lease.id,
                    "start": active_lease.start_date,
                    "end": active_lease.end_date,
                    "rent": active_lease.rent_amount,
                    "frequency": active_lease.get_payment_frequency_display(),
                }
                
                # All cheques for this lease
                all_cheques = active_lease.cheques.all().order_by('cheque_date')
                data["cheques"] = [
                    {
                        "id": c.id,
                        "cheque_number": c.cheque_number,
                        "bank_name": c.bank_name,
                        "amount": float(c.amount),
                        "cheque_date": c.cheque_date,
                        "status": c.status,
                    } for c in all_cheques
                ]

                # Next pending payment
                next_cheque = all_cheques.filter(status='PENDING').first()
                if next_cheque:
                    data["next_payment"] = {
                        "amount": float(next_cheque.amount),
                        "date": next_cheque.cheque_date,
                    }

                # Build notifications
                notifications = []
                
                today = datetime.date.today()
                upcoming = all_cheques.filter(
                    status='PENDING', 
                    cheque_date__lte=today + datetime.timedelta(days=7),
                    cheque_date__gte=today
                )
                for c in upcoming:
                    days_left = (c.cheque_date - today).days
                    notifications.append({
                        "type": "PAYMENT_DUE",
                        "severity": "HIGH",
                        "title": f"Payment due in {days_left} day{'s' if days_left != 1 else ''}",
                        "message": f"AED {float(c.amount):,.0f} — Cheque #{c.cheque_number}",
                        "date": str(c.cheque_date),
                    })
                
                bounced = all_cheques.filter(status='BOUNCED')
                for c in bounced:
                    notifications.append({
                        "type": "BOUNCED",
                        "severity": "EMERGENCY",
                        "title": "Cheque Bounced — Action Required",
                        "message": f"AED {float(c.amount):,.0f} — Cheque #{c.cheque_number}",
                        "date": str(c.cheque_date),
                    })

            # Maintenance tickets
            tickets = MaintenanceTicket.objects.filter(tenant=tenant).order_by('-created_at')
            data["maintenance_tickets"] = [
                {
                    "id": t.id,
                    "title": t.title or "General Maintenance",
                    "description": t.description,
                    "priority": t.priority,
                    "status": t.status,
                    "source": t.source,
                    "date": t.created_at.strftime("%Y-%m-%d"),
                } for t in tickets
            ]

            for t in tickets[:5]:
                if t.status == 'IN_PROGRESS':
                    data["notifications"].append({
                        "type": "MAINTENANCE_UPDATE",
                        "severity": "MEDIUM",
                        "title": f"'{t.title}' is being worked on",
                        "message": f"Status: In Progress",
                        "date": t.updated_at.strftime("%Y-%m-%d"),
                    })
                elif t.status == 'RESOLVED':
                    data["notifications"].append({
                        "type": "MAINTENANCE_RESOLVED",
                        "severity": "LOW",
                        "title": f"'{t.title}' has been resolved",
                        "message": "Your issue has been fixed",
                        "date": t.updated_at.strftime("%Y-%m-%d"),
                    })

            severity_order = {'EMERGENCY': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
            data["notifications"].sort(key=lambda x: severity_order.get(x["severity"], 4))

            return Response(data)

        except Exception as e:
            print("🔥 CRITICAL ERROR IN PROFILE VIEW 🔥")
            traceback.print_exc() 
            return Response({"error": str(e)}, status=500)