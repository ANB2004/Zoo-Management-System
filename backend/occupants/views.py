from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Occupant
from .serializers import OccupantSerializer


class OccupantViewSet(viewsets.ModelViewSet):
    queryset = Occupant.objects.select_related("enclosure").all()
    serializer_class = OccupantSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        active = self.request.query_params.get("active")
        if active == "true":
            qs = qs.filter(is_active=True)
        elif active == "false":
            qs = qs.filter(is_active=False)
        return qs

    @action(detail=True, methods=["patch"], permission_classes=[permissions.IsAuthenticated])
    def remove(self, request, pk=None):
        """Mark this occupant inactive — the enclosure becomes empty/available."""
        occupant = self.get_object()
        if not occupant.is_active:
            return Response({"detail": "Occupant already removed."}, status=status.HTTP_400_BAD_REQUEST)
        occupant.is_active = False
        occupant.date_removed = timezone.now()
        occupant.save(update_fields=["is_active", "date_removed"])
        return Response(OccupantSerializer(occupant).data)
