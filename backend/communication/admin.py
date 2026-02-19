from django.contrib import admin
from .models import ChatLog

@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ('organization', 'timestamp', 'user_message')
    list_filter = ('organization',)
    ordering = ('-timestamp',)