from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from django.core.mail import send_mail  # 👈 Needed for Email Alerts
from django.conf import settings        # 👈 Needed for Email Settings

from core.mixins import OrganizationQuerySetMixin
from .models import MaintenanceTicket
from .serializers import MaintenanceTicketSerializer
# 👇 Import your AI Agent
from .ai_agent import analyze_maintenance_image 

class MaintenanceViewSet(OrganizationQuerySetMixin, viewsets.ModelViewSet):
    queryset = MaintenanceTicket.objects.all()
    serializer_class = MaintenanceTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        
        # 1. SECURITY: Check Organization
        if not hasattr(user, 'organization') or not user.organization:
            raise ValidationError({"detail": "You must belong to an Organization."})
            
        # 2. SAVE INITIAL TICKET (Stores the image to disk)
        ticket = serializer.save(organization=user.organization)

        # 3. AI ANALYSIS
        if ticket.image:
            print(f"🤖 AI is analyzing Ticket #{ticket.id}...")
            
            # Call the AI Brain
            ai_result = analyze_maintenance_image(ticket.image.name)
            
            if ai_result:
                print(f"✅ AI Found: {ai_result}")
                
                # A. Update Priority (Safety Critical)
                ticket.priority = ai_result.get('priority', ticket.priority)
                
                # B. Update Text (Only if user description was too short/lazy)
                if len(ticket.description) < 20: 
                    ticket.description = ai_result.get('description', ticket.description)
                    ticket.title = ai_result.get('title', ticket.title)
                
                # C. Mark Source as AI/System
                ticket.source = 'SYSTEM'
                ticket.save()

                # 4. EMERGENCY ALERT SYSTEM 🚨
                # If AI says it's URGENT, wake up the Admin!
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
                            [user.email], # Alerts the Admin who uploaded it (or user.organization.owner.email)
                            fail_silently=False,
                        )
                        print("📧 Email Alert Sent!")
                    except Exception as e:
                        print(f"❌ Failed to send email alert: {e}")