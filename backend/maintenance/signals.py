from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps # Added for safe lookup

@receiver(post_save, sender='maintenance.MaintenanceTicket') # Changed to Ticket
def ai_triage_analysis(sender, instance, created, **kwargs):
    """
    Simulates the AI Triage. 
    If a request is new, scan for emergency keywords.
    """
    if created:
        # We get the model inside the function to avoid Circular Import errors
        MaintenanceTicket = apps.get_model('maintenance', 'MaintenanceTicket')
        
        emergency_keywords = ['flood', 'fire', 'burst', 'electric', 'smoke', 'gas']
        urgent_keywords = ['leak', 'broken lock', 'ac not working', 'no water']

        desc = instance.description.lower()
        new_priority = 'MEDIUM'
        
        # Keyword matching logic
        if any(word in desc for word in emergency_keywords):
            new_priority = 'EMERGENCY'
        elif any(word in desc for word in urgent_keywords):
            new_priority = 'HIGH'

        # Update without re-triggering signals
        MaintenanceTicket.objects.filter(pk=instance.pk).update(
            priority=new_priority
        )
        print(f"🤖 AI Triage Complete: Priority set to {new_priority}")