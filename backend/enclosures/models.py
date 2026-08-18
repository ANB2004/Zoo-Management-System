from django.db import models


class Enclosure(models.Model):
    """A physical enclosure that can hold at most one active occupant."""

    name = models.CharField(max_length=100, unique=True)
    section = models.CharField(max_length=100, blank=True, help_text="e.g. Savannah Zone")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def current_occupant(self):
        return self.occupants.filter(is_active=True).first()

    @property
    def is_occupied(self):
        return self.occupants.filter(is_active=True).exists()
