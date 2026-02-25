from django.urls import path
from .views import chat_view
from .notification_views import notification_list, notification_read, notification_count

urlpatterns = [
    path('chat/', chat_view, name='chat'),
    path('notifications/', notification_list, name='notification_list'),
    path('notifications/<int:pk>/read/', notification_read, name='notification_read'),
    path('notifications/count/', notification_count, name='notification_count'),
]