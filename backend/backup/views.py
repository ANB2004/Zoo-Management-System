from django.db import transaction
from django.utils.dateparse import parse_datetime
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from enclosures.models import Enclosure
from occupants.models import Occupant


class BackupExportView(APIView):
    """Download a full JSON snapshot of every enclosure and occupant
    (active and historical)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enclosures = [
            {"id": e.id, "name": e.name, "section": e.section, "notes": e.notes}
            for e in Enclosure.objects.all()
        ]
        occupants = [
            {
                "id": o.id,
                "enclosure": o.enclosure_id,
                "name": o.name,
                "species": o.species,
                "diet_category": o.diet_category,
                "food_type": o.food_type,
                "quantity_per_feeding_kg": str(o.quantity_per_feeding_kg),
                "feedings_per_day": o.feedings_per_day,
                "feeding_times": o.feeding_times,
                "is_active": o.is_active,
                "date_added": o.date_added.isoformat() if o.date_added else None,
                "date_removed": o.date_removed.isoformat() if o.date_removed else None,
            }
            for o in Occupant.objects.all()
        ]
        response = Response({"enclosures": enclosures, "occupants": occupants})
        response["Content-Disposition"] = 'attachment; filename="zoo_backup.json"'
        return response


class BackupImportView(APIView):
    """Restore a previously exported JSON snapshot. This REPLACES all
    current data — the frontend should confirm with the user first."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        data = request.data
        if "enclosures" not in data or "occupants" not in data:
            return Response(
                {"detail": "Invalid backup file — expected 'enclosures' and 'occupants' keys."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Occupant.objects.all().delete()
        Enclosure.objects.all().delete()

        enclosure_id_map = {}
        for enc in data["enclosures"]:
            new_enc = Enclosure.objects.create(
                name=enc["name"], section=enc.get("section", ""), notes=enc.get("notes", "")
            )
            enclosure_id_map[enc["id"]] = new_enc

        for occ in data["occupants"]:
            Occupant.objects.create(
                enclosure=enclosure_id_map[occ["enclosure"]],
                name=occ["name"],
                species=occ["species"],
                diet_category=occ["diet_category"],
                food_type=occ["food_type"],
                quantity_per_feeding_kg=occ["quantity_per_feeding_kg"],
                feedings_per_day=occ["feedings_per_day"],
                feeding_times=occ["feeding_times"],
                is_active=occ.get("is_active", True),
                date_added=parse_datetime(occ["date_added"]) if occ.get("date_added") else None,
                date_removed=parse_datetime(occ["date_removed"]) if occ.get("date_removed") else None,
            )

        return Response(
            {
                "detail": "Restore complete.",
                "enclosures_restored": len(data["enclosures"]),
                "occupants_restored": len(data["occupants"]),
            }
        )
