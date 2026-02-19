from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Cheque
from .serializers import ChequeSerializer

class ChequeViewSet(viewsets.ModelViewSet):
    serializer_class = ChequeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        🔧 FIX #5: Filter cheques by organization for SaaS security.
        """
        user = self.request.user
        
        # Superuser sees everything
        if user.is_superuser:
            queryset = Cheque.objects.all()
        elif hasattr(user, 'organization') and user.organization:
            queryset = Cheque.objects.filter(organization=user.organization)
        else:
            queryset = Cheque.objects.none()

        # Optional status filter
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('cheque_date')