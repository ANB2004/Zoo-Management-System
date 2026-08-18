from django.contrib import admin
from .models import Occupant


@admin.register(Occupant)
class OccupantAdmin(admin.ModelAdmin):
    list_display = ("name", "species", "diet_category", "enclosure", "is_active", "date_added")
    list_filter = ("diet_category", "is_active")
    search_fields = ("name", "species")
