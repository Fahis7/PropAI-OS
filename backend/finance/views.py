from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Cheque
from .serializers import ChequeSerializer

class ChequeViewSet(viewsets.ModelViewSet):
    queryset = Cheque.objects.all().order_by('cheque_date')
    serializer_class = ChequeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Cheque.objects.all()
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset