from collections import defaultdict

from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from occupants.models import Occupant


class FeedingScheduleView(APIView):
    """Today's feeding schedule, derived from all active occupants."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        occupants = Occupant.objects.filter(is_active=True).select_related("enclosure")
        events = []
        for occ in occupants:
            for t in occ.feeding_times:
                events.append(
                    {
                        "time": t,
                        "occupant_id": occ.id,
                        "occupant_name": occ.name,
                        "species": occ.species,
                        "enclosure": occ.enclosure.name,
                        "diet_category": occ.diet_category,
                        "food_type": occ.food_type,
                        "quantity_kg": float(occ.quantity_per_feeding_kg),
                    }
                )
        events.sort(key=lambda e: e["time"])
        return Response(events)


class DailyFoodTotalView(APIView):
    """Total kg of food required today, broken down by category and food type."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        occupants = Occupant.objects.filter(is_active=True)
        total = 0.0
        by_category = defaultdict(float)
        by_food_type = defaultdict(float)

        for occ in occupants:
            qty = float(occ.quantity_per_feeding_kg) * occ.feedings_per_day
            total += qty
            by_category[occ.diet_category] += qty
            by_food_type[occ.food_type] += qty

        return Response(
            {
                "total_kg": round(total, 2),
                "by_diet_category": {k: round(v, 2) for k, v in by_category.items()},
                "by_food_type": {k: round(v, 2) for k, v in by_food_type.items()},
            }
        )
