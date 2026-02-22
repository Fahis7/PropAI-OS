from django.db import models

class Property(models.Model):
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
    
    image = models.ImageField(upload_to='properties/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # 🆕 Rules & Regulations — Manager can edit, Chatbot uses for RAG
    rules_and_regulations = models.TextField(
        blank=True, null=True,
        help_text="Building rules, pet policy, parking, gym hours, visitor policy, etc. The AI chatbot uses this to answer tenant questions."
    )

    def __str__(self):
        return self.name

class Unit(models.Model):
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

    UNIT_STATUS = [
        ('VACANT', 'Vacant'),
        ('OCCUPIED', 'Occupied'),
        ('MAINTENANCE', 'Under Maintenance'),
        ('RESERVED', 'Reserved'),
    ]

    property = models.ForeignKey(Property, related_name='units', on_delete=models.CASCADE)
    unit_number = models.CharField(max_length=50)
    unit_type = models.CharField(max_length=20, choices=UNIT_TYPES)
    
    yearly_rent = models.DecimalField(max_digits=12, decimal_places=2)
    
    bedrooms = models.IntegerField(default=1, help_text="For residential units")
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    square_feet = models.IntegerField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=UNIT_STATUS, default='VACANT')

    def __str__(self):
        return f"{self.property.name} - {self.unit_number}"