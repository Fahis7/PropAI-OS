from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        # --- Level 1: The Bosses ---
        ('SUPER_ADMIN', 'Platform Admin'), # You (PropOS Owner)
        ('OWNER', 'Organization Owner'),   # The Landlord (Pays you)

        # --- Level 2: The Office Staff ---
        ('MANAGER', 'Property Manager'),   # Day-to-day operations
        ('FINANCE', 'Finance Officer'),    # Checks & Balances (Dubai Requirement)
        ('AGENT', 'Leasing Agent'),        # Sales only (Viewings)

        # --- Level 3: The Field Staff ---
        ('MAINTENANCE', 'Maintenance Staff'),
        ('SECURITY', 'Security Guard'),    # Building Access

        # --- Level 4: The Customers ---
        ('TENANT', 'Tenant'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='TENANT')
    
    # Critical: Link staff to their Company. 
    # We use a String Reference 'Organization' so we don't crash if Organization is defined below.
    organization = models.ForeignKey(
        'Organization', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='staff_members'
    )

    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Organization(models.Model):
    """
    The Company (e.g., 'BetterHomes'). 
    Every Property and Tenant belongs to an Organization.
    """
    name = models.CharField(max_length=255)
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='owned_organization')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name