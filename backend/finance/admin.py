from django.contrib import admin
from .models import Cheque

@admin.register(Cheque)
class ChequeAdmin(admin.ModelAdmin):
    list_display = ('cheque_number', 'tenant', 'amount', 'cheque_date', 'status', 'bank_name')
    list_filter = ('status', 'organization', 'bank_name')
    search_fields = ('cheque_number', 'tenant__name')
    list_editable = ('status',)
    ordering = ('-cheque_date',)