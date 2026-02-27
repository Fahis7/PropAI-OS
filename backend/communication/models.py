from django.db import models
from django.conf import settings


class ChatLog(models.Model):
    organization = models.ForeignKey('core.Organization', on_delete=models.CASCADE)
    user_message = models.TextField()
    ai_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat at {self.timestamp}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('TICKET_CREATED', 'New Ticket Created'),
        ('TICKET_ASSIGNED', 'Ticket Assigned to You'),
        ('TICKET_RESOLVED', 'Ticket Resolved'),
        ('TICKET_EMERGENCY', 'Emergency Ticket'),
        ('INQUIRY', 'New Property Inquiry'),
        ('TENANT_ONBOARDED', 'New Tenant Onboarded'),
        ('PAYMENT_DUE', 'Payment Due Soon'),
        ('LEASE_EXPIRING', 'Lease Expiring'),
        ('GENERAL', 'General Notice'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='GENERAL')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    ticket = models.ForeignKey(
        'maintenance.MaintenanceTicket',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='notifications'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type}: {self.title} -> {self.recipient.username}"


class Inquiry(models.Model):
    """Customer inquiry from public property page."""
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('CONTACTED', 'Contacted'),
        ('ONBOARDED', 'Tenant Onboarded'),
        ('REJECTED', 'Rejected'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='inquiries')
    unit = models.ForeignKey('properties.Unit', on_delete=models.CASCADE, related_name='inquiries', null=True, blank=True)

    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    message = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Inquiry from {self.customer_name} for {self.property.name}"