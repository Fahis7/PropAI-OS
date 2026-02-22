from core.models import User, Organization
from properties.models import Property

org = Organization.objects.get(id=2)
prop = Property.objects.filter(organization=org).first()
print(f"Org: {org.name}, Property: {prop.name}")

mgr, created = User.objects.get_or_create(
    username='manager1',
    defaults={
        'role': 'MANAGER',
        'first_name': 'Sara',
        'last_name': 'Al Rashid',
        'organization': org,
        'managed_property': prop,
    }
)
if created:
    mgr.set_password('manager123')
    mgr.save()
    print(f"Created manager: manager1 / manager123 -> {prop.name}")
else:
    mgr.managed_property = prop
    mgr.save()
    print(f"Updated manager: manager1 -> {prop.name}")