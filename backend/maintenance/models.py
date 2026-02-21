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

    REPORTED_BY_CHOICES = [
        ('TENANT', 'Tenant App'),
        ('ADMIN', 'Property Manager'),
        ('SYSTEM', 'AI System'),
    ]

    CATEGORY_CHOICES = [
        ('PLUMBING', 'Plumbing'),
        ('ELECTRICAL', 'Electrical'),
        ('HVAC', 'HVAC / Air Conditioning'),
        ('STRUCTURAL', 'Structural'),
        ('PEST_CONTROL', 'Pest Control'),
        ('PAINTING', 'Painting'),
        ('APPLIANCE', 'Appliance Repair'),
        ('GENERAL', 'General Maintenance'),
    ]

    # --- RELATIONS ---
    organization = models.ForeignKey(
        'core.Organization', on_delete=models.CASCADE, related_name='maintenance_tickets'
    )
    
    unit = models.ForeignKey(
        'properties.Unit', on_delete=models.CASCADE, related_name='maintenance_tickets'
    )
    
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_tickets'
    )

    # 🆕 Assigned technician
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name='assigned_tickets',
        limit_choices_to={'role': 'MAINTENANCE'},
    )

    # --- TICKET DETAILS ---
    title = models.CharField(max_length=100)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    source = models.CharField(max_length=20, choices=REPORTED_BY_CHOICES, default='ADMIN')
    
    # 🆕 AI Category for auto-assignment
    ai_category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='GENERAL', blank=True)

    # Evidence
    image = models.ImageField(upload_to='maintenance/', blank=True, null=True)

    # 🆕 Technician notes
    resolution_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.status})"