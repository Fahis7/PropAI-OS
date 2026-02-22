from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        # --- Level 1: The Bosses ---
        ('SUPER_ADMIN', 'Platform Admin'),
        ('OWNER', 'Organization Owner'),

        # --- Level 2: The Office Staff ---
        ('MANAGER', 'Property Manager'),
        ('FINANCE', 'Finance Officer'),
        ('AGENT', 'Leasing Agent'),

        # --- Level 3: The Field Staff ---
        ('MAINTENANCE', 'Maintenance Staff'),
        ('SECURITY', 'Security Guard'),

        # --- Level 4: The Customers ---
        ('TENANT', 'Tenant'),
    ]

    SPECIALTY_CHOICES = [
        ('PLUMBING', 'Plumbing'),
        ('ELECTRICAL', 'Electrical'),
        ('HVAC', 'HVAC / Air Conditioning'),
        ('STRUCTURAL', 'Structural'),
        ('PEST_CONTROL', 'Pest Control'),
        ('PAINTING', 'Painting'),
        ('APPLIANCE', 'Appliance Repair'),
        ('GENERAL', 'General Maintenance'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='TENANT')
    
    organization = models.ForeignKey(
        'Organization', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='staff_members'
    )

    phone = models.CharField(max_length=20, blank=True, null=True)

    # 🆕 Technician specialty for auto-assignment
    specialty = models.CharField(
        max_length=20, choices=SPECIALTY_CHOICES, 
        default='GENERAL', blank=True, null=True
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Organization(models.Model):
    name = models.CharField(max_length=255)
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='owned_organization')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name