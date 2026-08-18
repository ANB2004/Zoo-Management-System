import re

from rest_framework import serializers
from .models import Occupant

TIME_PATTERN = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")


class OccupantSerializer(serializers.ModelSerializer):
    enclosure_name = serializers.CharField(source="enclosure.name", read_only=True)

    class Meta:
        model = Occupant
        fields = [
            "id", "enclosure", "enclosure_name", "name", "species", "diet_category",
            "food_type", "quantity_per_feeding_kg", "feedings_per_day", "feeding_times",
            "is_active", "date_added", "date_removed",
        ]
        read_only_fields = ["is_active", "date_added", "date_removed"]

    def validate_enclosure(self, enclosure):
        if enclosure.is_occupied:
            raise serializers.ValidationError(
                f"'{enclosure.name}' already has an active occupant. Remove it first."
            )
        return enclosure

    def validate_feeding_times(self, value):
        if not isinstance(value, list) or not value:
            raise serializers.ValidationError("Provide a non-empty list of HH:MM times.")
        for t in value:
            if not TIME_PATTERN.match(str(t)):
                raise serializers.ValidationError(f"'{t}' is not a valid HH:MM time.")
        return value

    def validate(self, attrs):
        feedings_per_day = attrs.get("feedings_per_day")
        feeding_times = attrs.get("feeding_times")
        if feedings_per_day and feeding_times and len(feeding_times) != feedings_per_day:
            raise serializers.ValidationError(
                {"feeding_times": "The number of feeding times must match feedings_per_day."}
            )
        return attrs
