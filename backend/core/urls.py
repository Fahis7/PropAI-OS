from django.urls import path
from .views import MyTokenObtainPairView, dashboard_stats

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 👇 CORRECTED:
    # REMOVE 'api/' from here. 
    # Since this file is already inside 'api/', this line creates: "api/dashboard/stats/"
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'), 
]