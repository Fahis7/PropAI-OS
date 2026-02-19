from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TenantViewSet, LeaseViewSet, MyTenantProfileView # 👈 Import the new view

router = DefaultRouter()
router.register(r'tenants', TenantViewSet)
router.register(r'leases', LeaseViewSet)

urlpatterns = [
    # 1. Standard Routes (api/tenants/, api/leases/)
    path('', include(router.urls)),
    
    # 2. Custom "My Profile" Route (api/tenants/me/)
    path('me/', MyTenantProfileView.as_view(), name='my_profile'),
]