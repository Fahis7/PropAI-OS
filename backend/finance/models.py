from django.db import models

class Cheque(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending (Safe with Landlord)'),
        ('DEPOSITED', 'Deposited to Bank'),
        ('CLEARED', 'Cleared (Money Received)'),
        ('BOUNCED', 'Bounced (Action Required)'),
    ]

    # --- RELATIONS ---
    organization = models.ForeignKey(
        'core.Organization', on_delete=models.CASCADE, related_name='cheques', 
        null=True, blank=True, db_index=True
    )
    
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE, related_name='cheques',
        db_index=True
    )

    # 👇 NEW: Connects this cheque to a specific Contract
    lease = models.ForeignKey(
        'tenants.Lease', on_delete=models.CASCADE, related_name='cheques',
        null=True, blank=True # Optional for now, but good for automation
    )
    
    # --- DETAILS ---
    bank_name = models.CharField(max_length=50, null=True, blank=True) 
    cheque_number = models.CharField(max_length=50) # Increased length for "AUTO" tags
    cheque_date = models.DateField() 
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    image = models.ImageField(upload_to='cheques/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.cheque_number} - {self.amount} AED"

    class Meta:
        ordering = ['-cheque_date']