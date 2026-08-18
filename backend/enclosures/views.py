from rest_framework import viewsets, permissions
from .models import Enclosure
from .serializers import EnclosureSerializer


class EnclosureViewSet(viewsets.ModelViewSet):
    """
    list/retrieve: open to anyone (read-only dashboard use)
    create/update/delete: requires staff login
    """

    queryset = Enclosure.objects.all()
    serializer_class = EnclosureSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
