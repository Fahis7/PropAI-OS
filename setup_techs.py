from core.models import User, Organization

org = Organization.objects.get(id=2)
print(f"Target org: {org.name}")

tech1 = User.objects.get(username='technician1')
tech1.organization = org
tech1.specialty = 'GENERAL'
tech1.save()
print(f"Fixed: technician1 -> {org.name}")

data = [
    ('tech_plumber', 'Ali', 'Hassan', 'PLUMBING'),
    ('tech_electric', 'Omar', 'Farouk', 'ELECTRICAL'),
    ('tech_hvac', 'Khalid', 'Noor', 'HVAC'),
]

for uname, fname, lname, spec in data:
    user, created = User.objects.get_or_create(
        username=uname,
        defaults={
            'role': 'MAINTENANCE',
            'first_name': fname,
            'last_name': lname,
            'specialty': spec,
            'organization': org,
        }
    )
    if created:
        user.set_password('tech123')
        user.save()
        print(f"Created: {uname} ({spec})")
    else:
        user.organization = org
        user.specialty = spec
        user.save()
        print(f"Updated: {uname} ({spec})")

print("---")
for t in User.objects.filter(role='MAINTENANCE'):
    print(f"{t.username} | {t.specialty} | {t.organization}")