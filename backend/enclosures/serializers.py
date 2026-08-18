from rest_framework import serializers
from .models import Enclosure


class EnclosureSerializer(serializers.ModelSerializer):
    is_occupied = serializers.BooleanField(read_only=True)
    current_occupant = serializers.SerializerMethodField()

    class Meta:
        model = Enclosure
        fields = ["id", "name", "section", "notes", "created_at", "is_occupied", "current_occupant"]

    def get_current_occupant(self, obj):
        occ = obj.current_occupant
        if not occ:
            return None
        return {
            "id": occ.id,
            "name": occ.name,
            "species": occ.species,
            "diet_category": occ.diet_category,
            "food_type": occ.food_type,
            "quantity_per_feeding_kg": str(occ.quantity_per_feeding_kg),
            "feedings_per_day": occ.feedings_per_day,
            "feeding_times": occ.feeding_times,
        }
