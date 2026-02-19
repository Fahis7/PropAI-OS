from django.db import models
from django.conf import settings

class MaintenanceTicket(models.Model):
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('EMERGENCY', 'Emergency'),
    ]

    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]

    # 👇 NEW: Track who reported the issue
    REPORTED_BY_CHOICES = [
        ('TENANT', 'Tenant App'),
        ('ADMIN', 'Property Manager'),
        ('SYSTEM', 'AI System'),
    ]

    # --- RELATIONS ---
    # 1. Organization (SaaS Security)
    organization = models.ForeignKey(
        'core.Organization', on_delete=models.CASCADE, related_name='maintenance_tickets'
    )
    
    # 2. Unit (Where is the problem?)
    unit = models.ForeignKey(
        'properties.Unit', on_delete=models.CASCADE, related_name='maintenance_tickets'
    )
    
    # 3. Tenant (Who reported it?) - Optional, because sometimes the Landlord reports it.
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_tickets'
    )

    # --- TICKET DETAILS ---
    title = models.CharField(max_length=100)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    # 👇 NEW: Added 'source' field
    source = models.CharField(max_length=20, choices=REPORTED_BY_CHOICES, default='ADMIN')

    # Evidence (Photo of the damage)
    image = models.ImageField(upload_to='maintenance/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.status})"