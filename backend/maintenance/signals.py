import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps

@receiver(post_save, sender='maintenance.MaintenanceTicket')
def ai_triage_analysis(sender, instance, created, **kwargs):
    """
    🔧 FIX #7: Keyword-based fallback triage.
    Only runs if:
      1. Ticket is newly created
      2. No image was uploaded (AI agent in views.py handles image-based triage)
      3. Source is not already 'SYSTEM' (meaning AI already processed it)
    """
    if not created:
        return
    
    # Skip if AI agent already handled this ticket
    if instance.source == 'SYSTEM':
        return
    
    # Skip if ticket has an image — let the AI Vision agent in views.py handle it
    if instance.image:
        return

    MaintenanceTicket = apps.get_model('maintenance', 'MaintenanceTicket')
    
    emergency_keywords = ['flood', 'fire', 'burst', 'electric', 'smoke', 'gas', 'explosion']
    urgent_keywords = ['leak', 'broken lock', 'ac not working', 'no water', 'no electricity', 'sewage']

    desc = instance.description.lower()
    title = instance.title.lower() if instance.title else ''
    combined = f"{desc} {title}"
    
    new_priority = 'MEDIUM'
    
    if any(word in combined for word in emergency_keywords):
        new_priority = 'EMERGENCY'
    elif any(word in combined for word in urgent_keywords):
        new_priority = 'HIGH'

    # Update without re-triggering signals
    MaintenanceTicket.objects.filter(pk=instance.pk).update(
        priority=new_priority
    )
    print(f"🤖 Keyword Triage Complete: Priority set to {new_priority}")