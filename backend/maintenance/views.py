from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes as perms
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings

from core.mixins import OrganizationQuerySetMixin
from .models import MaintenanceTicket
from .serializers import MaintenanceTicketSerializer
from .ai_agent import analyze_maintenance_image
from tenants.models import Tenant


class MaintenanceViewSet(OrganizationQuerySetMixin, viewsets.ModelViewSet):
    queryset = MaintenanceTicket.objects.all()
    serializer_class = MaintenanceTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Super admin sees all
        if user.is_superuser:
            return MaintenanceTicket.objects.all().order_by('-created_at')

        # Technician — only sees assigned tickets
        if user.role == 'MAINTENANCE':
            return MaintenanceTicket.objects.filter(
                assigned_to=user
            ).order_by('-created_at')

        # Staff with organization — use org filter
        if hasattr(user, 'organization') and user.organization:
            return MaintenanceTicket.objects.filter(
                organization=user.organization
            ).order_by('-created_at')

        # Tenant — show only their own tickets
        if user.role == 'TENANT':
            try:
                tenant = Tenant.objects.get(user=user)
                return MaintenanceTicket.objects.filter(tenant=tenant).order_by('-created_at')
            except Tenant.DoesNotExist:
                return MaintenanceTicket.objects.none()

        return MaintenanceTicket.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        org = None
        tenant = None

        if user.role == 'TENANT':
            try:
                tenant = Tenant.objects.get(user=user)
            except Tenant.DoesNotExist:
                raise ValidationError({"detail": "Tenant profile not found."})

            unit = serializer.validated_data.get('unit')
            if unit and unit.property:
                org = unit.property.organization
            else:
                raise ValidationError({"detail": "Could not determine organization from unit."})
        else:
            if not hasattr(user, 'organization') or not user.organization:
                raise ValidationError({"detail": "You must belong to an Organization."})
            org = user.organization

        ticket = serializer.save(organization=org, tenant=tenant)

        # AI ANALYSIS
        if ticket.image:
            print(f"🤖 AI is analyzing Ticket #{ticket.id}...")
            
            ai_result = analyze_maintenance_image(ticket.image.name)
            
            if ai_result:
                print(f"✅ AI Found: {ai_result}")
                
                ticket.priority = ai_result.get('priority', ticket.priority)
                
                if len(ticket.description) < 20: 
                    ticket.description = ai_result.get('description', ticket.description)
                    ticket.title = ai_result.get('title', ticket.title)
                
                ticket.source = 'SYSTEM'
                ticket.save()

                if ticket.priority in ['HIGH', 'EMERGENCY']:
                    print("🚨 HIGH PRIORITY DETECTED - SENDING EMAIL ALERT")
                    
                    subject = f"🚨 URGENT: {ticket.priority} Issue at Unit {ticket.unit.unit_number}"
                    message = f"""
                    URGENT MAINTENANCE REPORT
                    -------------------------
                    Issue: {ticket.title}
                    Priority: {ticket.priority}
                    Location: Unit {ticket.unit.unit_number} ({ticket.unit.property.name})
                    
                    AI Analysis:
                    {ticket.description}
                    
                    Please login to the PropOS Dashboard to investigate.
                    """
                    
                    try:
                        send_mail(
                            subject,
                            message,
                            settings.EMAIL_HOST_USER,
                            [user.email],
                            fail_silently=False,
                        )
                        print("📧 Email Alert Sent!")
                    except Exception as e:
                        print(f"❌ Failed to send email alert: {e}")

    def perform_update(self, serializer):
        """Allow technicians to update status and resolution notes."""
        user = self.request.user
        
        if user.role == 'MAINTENANCE':
            # Technicians can only update status and resolution_notes
            allowed_fields = {'status', 'resolution_notes'}
            update_fields = set(serializer.validated_data.keys())
            
            disallowed = update_fields - allowed_fields
            if disallowed:
                raise ValidationError({
                    "detail": f"Technicians can only update: status, resolution_notes. Not allowed: {disallowed}"
                })
        
        serializer.save()


# 🆕 Technician stats endpoint
@api_view(['GET'])
@perms([IsAuthenticated])
def technician_stats(request):
    """
    GET /api/technician/stats/
    Returns stats for the logged-in technician.
    """
    user = request.user
    
    if user.role != 'MAINTENANCE':
        return Response({"error": "Not a technician."}, status=403)
    
    tickets = MaintenanceTicket.objects.filter(assigned_to=user)
    
    return Response({
        "total": tickets.count(),
        "open": tickets.filter(status='OPEN').count(),
        "in_progress": tickets.filter(status='IN_PROGRESS').count(),
        "resolved": tickets.filter(status='RESOLVED').count(),
        "emergency": tickets.filter(priority='EMERGENCY').count(),
        "high": tickets.filter(priority='HIGH').count(),
    })