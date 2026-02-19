from django.db import models

class Property(models.Model):
    # 👇 KEEPING YOUR ORGANIZATION LINK (Crucial for Multi-Tenancy)
    organization = models.ForeignKey('core.Organization', on_delete=models.CASCADE, related_name='properties')

    PROPERTY_TYPES = [
        ('RESIDENTIAL', 'Residential'),
        ('COMMERCIAL', 'Commercial'),
        ('MIXED', 'Mixed Use'),
    ]

    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100, default='Dubai')
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES, default='RESIDENTIAL')
    description = models.TextField(blank=True)
    
    # Image handling
    image = models.ImageField(upload_to='properties/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Unit(models.Model):
    # 👇 PRODUCTION UPGRADE: More detailed unit types
    UNIT_TYPES = [
        ('1BHK', '1 Bedroom'),
        ('2BHK', '2 Bedroom'),
        ('3BHK', '3 Bedroom'),
        ('STUDIO', 'Studio'),
        ('VILLA', 'Villa'),
        ('OFFICE', 'Office Space'),
        ('RETAIL', 'Retail Shop'),
        ('WAREHOUSE', 'Warehouse'),
    ]

    # 👇 PRODUCTION UPGRADE: Granular Status (Not just True/False)
    UNIT_STATUS = [
        ('VACANT', 'Vacant'),
        ('OCCUPIED', 'Occupied'),
        ('MAINTENANCE', 'Under Maintenance'),
        ('RESERVED', 'Reserved'),
    ]

    property = models.ForeignKey(Property, related_name='units', on_delete=models.CASCADE)
    unit_number = models.CharField(max_length=50)  # e.g., "101", "Office 404"
    unit_type = models.CharField(max_length=20, choices=UNIT_TYPES)
    
    # Financials
    yearly_rent = models.DecimalField(max_digits=12, decimal_places=2)
    
    # 👇 NEW: Physical Details (Critical for reports/contracts)
    bedrooms = models.IntegerField(default=1, help_text="For residential units")
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=1.0) # Allows 1.5 baths
    square_feet = models.IntegerField(blank=True, null=True)
    
    # Status Management
    status = models.CharField(max_length=20, choices=UNIT_STATUS, default='VACANT')
    # We remove 'is_occupied' because 'status' covers it better

    def __str__(self):
        return f"{self.property.name} - {self.unit_number}"