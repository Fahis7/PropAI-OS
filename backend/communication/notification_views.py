from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from core.models import User


def create_notification(recipient, notification_type, title, message, ticket=None):
    """Helper to create a notification. Call this from anywhere."""
    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        ticket=ticket,
    )


def notify_ticket_created(ticket):
    """Notify admins/managers when a new ticket is created."""
    org = ticket.organization
    
    # Notify all admins/owners/managers in this org
    recipients = User.objects.filter(
        organization=org,
        role__in=['OWNER', 'MANAGER'],
    )
    
    emoji = '🚨' if ticket.priority in ['EMERGENCY', 'HIGH'] else '🔧'
    ntype = 'TICKET_EMERGENCY' if ticket.priority == 'EMERGENCY' else 'TICKET_CREATED'
    
    for user in recipients:
        create_notification(
            recipient=user,
            notification_type=ntype,
            title=f"{emoji} New Ticket: {ticket.title}",
            message=f"Unit {ticket.unit.unit_number} ({ticket.unit.property.name}) — Priority: {ticket.priority}. Category: {ticket.ai_category}.",
            ticket=ticket,
        )
    
    print(f"🔔 Notified {recipients.count()} admin(s) about Ticket #{ticket.id}")


def notify_ticket_assigned(ticket):
    """Notify the technician when a ticket is assigned to them."""
    if not ticket.assigned_to:
        return
    
    create_notification(
        recipient=ticket.assigned_to,
        notification_type='TICKET_ASSIGNED',
        title=f"🛠️ New Job: {ticket.title}",
        message=f"You've been assigned to Unit {ticket.unit.unit_number} ({ticket.unit.property.name}). Priority: {ticket.priority}. Category: {ticket.ai_category}.",
        ticket=ticket,
    )
    
    print(f"🔔 Notified {ticket.assigned_to.username} about assignment")


def notify_ticket_resolved(ticket):
    """Notify admin and tenant when a ticket is resolved."""
    org = ticket.organization
    
    # Notify admins
    admins = User.objects.filter(organization=org, role__in=['OWNER', 'MANAGER'])
    for user in admins:
        create_notification(
            recipient=user,
            notification_type='TICKET_RESOLVED',
            title=f"✅ Resolved: {ticket.title}",
            message=f"Ticket #{ticket.id} in Unit {ticket.unit.unit_number} has been resolved by {ticket.assigned_to.get_full_name() if ticket.assigned_to else 'unknown'}.",
            ticket=ticket,
        )
    
    # Notify tenant if exists
    if ticket.tenant and ticket.tenant.user:
        create_notification(
            recipient=ticket.tenant.user,
            notification_type='TICKET_RESOLVED',
            title=f"✅ Your issue has been resolved!",
            message=f"'{ticket.title}' in Unit {ticket.unit.unit_number} has been fixed. {ticket.resolution_notes or ''}",
            ticket=ticket,
        )


# ═══ API ENDPOINTS ═══

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """GET /api/notifications/ — returns user's notifications."""
    notifications = Notification.objects.filter(recipient=request.user)[:30]
    
    data = [
        {
            "id": n.id,
            "type": n.notification_type,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "ticket_id": n.ticket_id,
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M"),
            "time_ago": _time_ago(n.created_at),
        }
        for n in notifications
    ]
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_read(request, pk):
    """POST /api/notifications/<pk>/read/ — mark as read."""
    try:
        n = Notification.objects.get(id=pk, recipient=request.user)
        n.is_read = True
        n.save()
        return Response({"status": "read"})
    except Notification.DoesNotExist:
        return Response({"error": "Not found."}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_count(request):
    """GET /api/notifications/count/ — returns unread count."""
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({"unread": count})


def _time_ago(dt):
    """Return human-readable time ago string."""
    from django.utils import timezone
    now = timezone.now()
    diff = now - dt
    
    seconds = diff.total_seconds()
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        mins = int(seconds // 60)
        return f"{mins}m ago"
    elif seconds < 86400:
        hrs = int(seconds // 3600)
        return f"{hrs}h ago"
    else:
        days = int(seconds // 86400)
        return f"{days}d ago"