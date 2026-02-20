from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
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

        # Staff with organization — use org filter
        if hasattr(user, 'organization') and user.organization:
            return MaintenanceTicket.objects.filter(
                organization=user.organization
            ).order_by('-created_at')

        # 🔧 FIX: Tenant — show only their own tickets
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

        # 🔧 FIX: If user is a tenant, get org from their unit's property
        if user.role == 'TENANT':
            try:
                tenant = Tenant.objects.get(user=user)
            except Tenant.DoesNotExist:
                raise ValidationError({"detail": "Tenant profile not found."})

            # Get org from the unit being reported
            unit = serializer.validated_data.get('unit')
            if unit and unit.property:
                org = unit.property.organization
            else:
                raise ValidationError({"detail": "Could not determine organization from unit."})
        else:
            # Staff user — use their org directly
            if not hasattr(user, 'organization') or not user.organization:
                raise ValidationError({"detail": "You must belong to an Organization."})
            org = user.organization

        # SAVE INITIAL TICKET
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

                # EMERGENCY ALERT
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