class OrganizationQuerySetMixin:
    """
    Magic SaaS Filter: Only show data belonging to the User's Organization.
    """
    def get_queryset(self):
        # 1. Get the base data (e.g., All Properties)
        queryset = super().get_queryset()
        
        # 2. Get the user's organization
        user_org = self.request.user.organization
        
        # 3. If Super Admin, show everything (Optional)
        if self.request.user.is_superuser:
            return queryset
            
        # 4. FILTER: Only show items linked to this Org
        return queryset.filter(organization=user_org)