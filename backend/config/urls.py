from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

# Import Views
from core.views import dashboard_stats, MyTokenObtainPairView
from finance.views import ChequeViewSet
from properties.views import PropertyViewSet, UnitViewSet
from tenants.views import TenantViewSet, LeaseViewSet, MyTenantProfileView # 👈 1. Added MyTenantProfileView
from rest_framework_simplejwt.views import TokenRefreshView
from maintenance.views import MaintenanceViewSet

# Router Setup
router = DefaultRouter()
router.register(r'cheques', ChequeViewSet, basename='cheque')
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'leases', LeaseViewSet, basename='lease')
router.register(r'maintenance', MaintenanceViewSet, basename='maintenance')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 👇 2. FIX: Add this specific path BEFORE the router includes
    path('api/me/', MyTenantProfileView.as_view(), name='my_profile'),

    # API Routes
    path('api/', include(router.urls)),
    
    # Dashboard Stats
    path('api/dashboard/stats/', dashboard_stats, name='dashboard_stats'),
    
    # Authentication
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)