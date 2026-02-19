from django.contrib import admin
from .models import MaintenanceTicket

@admin.register(MaintenanceTicket)
class MaintenanceTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'unit', 'priority', 'status', 'source', 'created_at')
    list_filter = ('priority', 'status', 'source', 'organization')
    search_fields = ('title', 'description')
    list_editable = ('priority', 'status')
    ordering = ('-created_at',)