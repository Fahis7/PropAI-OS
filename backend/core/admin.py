from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Organization

class CustomUserAdmin(UserAdmin):
    # 1. Add your new fields to the "Edit User" form
    fieldsets = UserAdmin.fieldsets + (
        ('Professional Profile', {'fields': ('role', 'organization', 'phone')}),
    )
    
    # 2. Add your new fields to the "Create User" form
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Professional Profile', {'fields': ('role', 'organization', 'phone')}),
    )

    # 3. What columns to show in the User List table
    list_display = ('username', 'email', 'role', 'organization', 'is_staff')
    
    # 4. Add Filters on the right side (Filter by Role or Company)
    list_filter = ('role', 'organization', 'is_staff', 'is_active')

# Register the models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Organization)