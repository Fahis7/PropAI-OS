from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes as perms
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Count, Q

from core.models import User
from core.mixins import OrganizationQuerySetMixin
from .models import MaintenanceTicket
from .serializers import MaintenanceTicketSerializer
from .ai_agent import analyze_maintenance_image
from tenants.models import Tenant

# 🆕 Notification triggers
from communication.notification_views import (
    notify_ticket_created, notify_ticket_assigned, notify_ticket_resolved
)


# ═══════════════════════════════════════════════════
# AI CATEGORY DETECTION (Keyword-based, fast & free)
# ═══════════════════════════════════════════════════
CATEGORY_KEYWORDS = {
    'PLUMBING': ['leak', 'water', 'pipe', 'drain', 'tap', 'faucet', 'toilet', 'shower', 'sink', 'flood', 'drip', 'plumb', 'sewage', 'clog', 'blocked drain', 'water heater', 'geyser'],
    'ELECTRICAL': ['electric', 'power', 'light', 'switch', 'socket', 'outlet', 'wiring', 'fuse', 'breaker', 'voltage', 'spark', 'short circuit', 'bulb', 'fan', 'inverter'],
    'HVAC': ['ac', 'air condition', 'heating', 'cooling', 'thermostat', 'hvac', 'duct', 'vent', 'temperature', 'compressor', 'refrigerant', 'cold air', 'hot air', 'filter'],
    'STRUCTURAL': ['wall', 'crack', 'ceiling', 'floor', 'door', 'window', 'roof', 'tile', 'concrete', 'foundation', 'beam', 'column', 'seepage', 'damp'],
    'PEST_CONTROL': ['pest', 'cockroach', 'ant', 'rat', 'mouse', 'insect', 'bug', 'termite', 'rodent', 'spider', 'mosquito', 'infestation'],
    'PAINTING': ['paint', 'wall color', 'peeling', 'stain', 'discolor', 'mold', 'mould', 'damp patch', 'touch up'],
    'APPLIANCE': ['washer', 'dryer', 'dishwasher', 'oven', 'stove', 'microwave', 'refrigerator', 'fridge', 'freezer', 'machine', 'appliance', 'intercom', 'doorbell'],
}


def detect_category(title, description=""):
    text = f"{title} {description}".lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[category] = score
    if scores:
        return max(scores, key=scores.get)
    return 'GENERAL'


def auto_assign_technician(ticket):
    org = ticket.organization
    category = ticket.ai_category

    techs = User.objects.filter(
        role='MAINTENANCE', organization=org, specialty=category,
    ).annotate(
        active_tickets=Count('assigned_tickets', filter=Q(
            assigned_tickets__status__in=['OPEN', 'IN_PROGRESS']
        ))
    ).order_by('active_tickets')

    if techs.exists():
        chosen = techs.first()
        ticket.assigned_to = chosen
        ticket.save()
        print(f"🤖 Auto-assigned Ticket #{ticket.id} ({category}) → {chosen.get_full_name() or chosen.username}")
        return chosen

    general_techs = User.objects.filter(
        role='MAINTENANCE', organization=org, specialty='GENERAL',
    ).annotate(
        active_tickets=Count('assigned_tickets', filter=Q(
            assigned_tickets__status__in=['OPEN', 'IN_PROGRESS']
        ))
    ).order_by('active_tickets')

    if general_techs.exists():
        chosen = general_techs.first()
        ticket.assigned_to = chosen
        ticket.save()
        print(f"🤖 Fallback-assigned Ticket #{ticket.id} → {chosen.get_full_name() or chosen.username}")
        return chosen

    any_tech = User.objects.filter(
        role='MAINTENANCE', organization=org,
    ).annotate(
        active_tickets=Count('assigned_tickets', filter=Q(
            assigned_tickets__status__in=['OPEN', 'IN_PROGRESS']
        ))
    ).order_by('active_tickets').first()

    if any_tech:
        ticket.assigned_to = any_tech
        ticket.save()
        print(f"🤖 Last-resort assigned Ticket #{ticket.id} → {any_tech.get_full_name() or any_tech.username}")
        return any_tech

    print(f"⚠️ No technicians available for Ticket #{ticket.id}")
    return None


class MaintenanceViewSet(OrganizationQuerySetMixin, viewsets.ModelViewSet):
    queryset = MaintenanceTicket.objects.all()
    serializer_class = MaintenanceTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return MaintenanceTicket.objects.all().order_by('-created_at')

        if user.role == 'MAINTENANCE':
            return MaintenanceTicket.objects.filter(assigned_to=user).order_by('-created_at')

        if hasattr(user, 'organization') and user.organization:
            return MaintenanceTicket.objects.filter(organization=user.organization).order_by('-created_at')

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

        # STEP 1: AI Image Analysis
        if ticket.image:
            print(f"🤖 AI is analyzing Ticket #{ticket.id}...")
            ai_result = analyze_maintenance_image(ticket.image.name)
            if ai_result:
                ticket.priority = ai_result.get('priority', ticket.priority)
                if len(ticket.description) < 20:
                    ticket.description = ai_result.get('description', ticket.description)
                    ticket.title = ai_result.get('title', ticket.title)
                ticket.source = 'SYSTEM'
                ticket.save()

        # STEP 2: AI Category Detection
        category = detect_category(ticket.title, ticket.description)
        ticket.ai_category = category
        ticket.save()
        print(f"🏷️ Category detected: {category} for Ticket #{ticket.id}")

        # STEP 3: Auto-assign Technician
        assigned = auto_assign_technician(ticket)

        # 🆕 STEP 4: Send Notifications
        notify_ticket_created(ticket)
        if assigned:
            notify_ticket_assigned(ticket)

        # STEP 5: Emergency Email Alert
        if ticket.priority in ['HIGH', 'EMERGENCY']:
            assigned_info = f"Assigned to: {assigned.get_full_name() or assigned.username}" if assigned else "⚠️ NOT ASSIGNED"
            subject = f"🚨 URGENT: {ticket.priority} Issue at Unit {ticket.unit.unit_number}"
            message = f"""
            URGENT MAINTENANCE REPORT
            -------------------------
            Issue: {ticket.title}
            Category: {category}
            Priority: {ticket.priority}
            Location: Unit {ticket.unit.unit_number} ({ticket.unit.property.name})
            {assigned_info}
            
            AI Analysis:
            {ticket.description}
            """
            try:
                send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email], fail_silently=False)
                print("📧 Email Alert Sent!")
            except Exception as e:
                print(f"❌ Failed to send email alert: {e}")

    def perform_update(self, serializer):
        user = self.request.user
        old_status = self.get_object().status

        if user.role == 'MAINTENANCE':
            allowed_fields = {'status', 'resolution_notes'}
            update_fields = set(serializer.validated_data.keys())
            disallowed = update_fields - allowed_fields
            if disallowed:
                raise ValidationError({"detail": f"Technicians can only update: status, resolution_notes."})

        instance = serializer.save()

        # 🆕 Notify on status change to RESOLVED
        new_status = instance.status
        if old_status != 'RESOLVED' and new_status == 'RESOLVED':
            notify_ticket_resolved(instance)
            print(f"🔔 Resolved notification sent for Ticket #{instance.id}")


@api_view(['GET'])
@perms([IsAuthenticated])
def technician_stats(request):
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