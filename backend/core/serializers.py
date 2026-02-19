from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims (Role, Username)
        token['role'] = user.role
        token['username'] = user.username
        
        # Safe check for organization
        token['organization_id'] = user.organization.id if user.organization else None

        return token