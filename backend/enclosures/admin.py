from django.contrib import admin
from .models import Enclosure


@admin.register(Enclosure)
class EnclosureAdmin(admin.ModelAdmin):
    list_display = ("name", "section", "is_occupied", "created_at")
    search_fields = ("name", "section")
