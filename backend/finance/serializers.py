from rest_framework import serializers
from .models import Cheque

class ChequeSerializer(serializers.ModelSerializer):
    tenant_name = serializers.ReadOnlyField(source='tenant.name')
    # 👇 Show which unit this cheque pays for
    unit_number = serializers.CharField(source='lease.unit.unit_number', read_only=True)

    class Meta:
        model = Cheque
        fields = [
            'id', 'tenant', 'tenant_name', 'lease', 'unit_number', 
            'bank_name', 'amount', 'cheque_number', 'cheque_date', 'status', 'image'
        ]