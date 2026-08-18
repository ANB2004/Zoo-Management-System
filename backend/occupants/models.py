from django.db import models
from django.utils import timezone

from enclosures.models import Enclosure


class DietCategory(models.TextChoices):
    HERBIVORE = "HERBIVORE", "Herbivore"
    CARNIVORE = "CARNIVORE", "Carnivore"


class Occupant(models.Model):
    """An animal/bird housed in an enclosure. Only one active occupant is
    allowed per enclosure at a time (enforced by the constraint below)."""

    enclosure = models.ForeignKey(Enclosure, related_name="occupants", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    diet_category = models.CharField(max_length=20, choices=DietCategory.choices)
    food_type = models.CharField(max_length=100, help_text="e.g. Hay, Raw Meat, Fruits")
    quantity_per_feeding_kg = models.DecimalField(max_digits=6, decimal_places=2)
    feedings_per_day = models.PositiveSmallIntegerField()
    feeding_times = models.JSONField(default=list, help_text='List of "HH:MM" strings')
    is_active = models.BooleanField(default=True)
    date_added = models.DateTimeField(default=timezone.now)
    date_removed = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-date_added"]
        constraints = [
            models.UniqueConstraint(
                fields=["enclosure"],
                condition=models.Q(is_active=True),
                name="one_active_occupant_per_enclosure",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.species})"
