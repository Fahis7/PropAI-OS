class OrganizationQuerySetMixin:
    """
    Magic SaaS Filter: Only show data belonging to the User's Organization.
    🔧 FIX #12: Now safely handles users without an organization.
    """
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Super Admin sees everything
        if user.is_superuser:
            return queryset
        
        # 🔧 FIX: Check if user has organization before filtering
        if not hasattr(user, 'organization') or not user.organization:
            return queryset.none()
            
        return queryset.filter(organization=user.organization)