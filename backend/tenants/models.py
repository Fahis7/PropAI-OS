from django.db import models
from django.conf import settings 
from properties.models import Unit
from django.db.models.signals import post_delete  # 👈 Import for Signals
from django.dispatch import receiver             # 👈 Import for Signals

class Tenant(models.Model):
    # Link to the standard Django User (for Login)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='tenant_profile', 
        null=True, 
        blank=True
    )
    
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    
    nationality = models.CharField(max_length=100, blank=True, null=True)
    emirates_id = models.CharField(max_length=50, blank=True, null=True)
    passport_number = models.CharField(max_length=50, blank=True, null=True)
    ejari_number = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Lease(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='leases')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='leases')
    
    start_date = models.DateField()
    end_date = models.DateField()
    
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    payment_frequency = models.CharField(max_length=20, choices=[
        ('1_CHEQUE', '1 Cheque'),
        ('4_CHEQUES', '4 Cheques'),
        ('12_CHEQUES', '12 Cheques')
    ], default='4_CHEQUES')
    
    is_active = models.BooleanField(default=True)
    contract_file = models.FileField(upload_to='leases/contracts/', blank=True, null=True)

    def __str__(self):
        return f"{self.tenant.name} - {self.unit.unit_number}"

# 👇 THE FIX: AUTOMATICALLY FREE UP THE UNIT
# When a Lease is deleted (e.g. Tenant is deleted), this runs immediately.
@receiver(post_delete, sender=Lease)
def release_unit_on_lease_delete(sender, instance, **kwargs):
    """
    When a Lease is deleted, mark the Unit as VACANT.
    """
    if instance.unit:
        print(f"🔓 Lease deleted. Making Unit {instance.unit.unit_number} VACANT again.")
        instance.unit.status = 'VACANT'
        instance.unit.save()