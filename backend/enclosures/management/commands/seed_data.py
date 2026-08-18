from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from enclosures.models import Enclosure
from occupants.models import Occupant, DietCategory


class Command(BaseCommand):
    help = "Seed sample enclosures, occupants, and a staff login for local/demo use."

    def handle(self, *args, **options):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "ChangeMe123!")
            self.stdout.write(self.style.SUCCESS("Created staff user 'admin' / 'ChangeMe123!' (change this!)"))
        else:
            self.stdout.write("Staff user 'admin' already exists, skipping.")

        enclosures_data = [
            {"name": "Enclosure A1", "section": "Savannah Zone"},
            {"name": "Enclosure A2", "section": "Savannah Zone"},
            {"name": "Enclosure B1", "section": "Predator Trail"},
            {"name": "Enclosure B2", "section": "Predator Trail"},
            {"name": "Enclosure C1", "section": "Aviary"},
        ]
        enclosures = {}
        for data in enclosures_data:
            enc, created = Enclosure.objects.get_or_create(name=data["name"], defaults=data)
            enclosures[data["name"]] = enc
            if created:
                self.stdout.write(f"Created {enc.name}")

        occupants_data = [
            dict(
                enclosure=enclosures["Enclosure A1"], name="Ellie", species="African Elephant",
                diet_category=DietCategory.HERBIVORE, food_type="Hay & Fruits",
                quantity_per_feeding_kg=15, feedings_per_day=3,
                feeding_times=["07:00", "13:00", "18:00"],
            ),
            dict(
                enclosure=enclosures["Enclosure A2"], name="Ziggy", species="Plains Zebra",
                diet_category=DietCategory.HERBIVORE, food_type="Hay & Grain",
                quantity_per_feeding_kg=4, feedings_per_day=2,
                feeding_times=["08:00", "17:00"],
            ),
            dict(
                enclosure=enclosures["Enclosure B1"], name="Leo", species="African Lion",
                diet_category=DietCategory.CARNIVORE, food_type="Raw Meat",
                quantity_per_feeding_kg=6, feedings_per_day=1,
                feeding_times=["16:00"],
            ),
            dict(
                enclosure=enclosures["Enclosure C1"], name="Kiwi", species="Macaw",
                diet_category=DietCategory.HERBIVORE, food_type="Fruits & Seeds",
                quantity_per_feeding_kg=0.3, feedings_per_day=2,
                feeding_times=["09:00", "15:00"],
            ),
        ]
        for data in occupants_data:
            if not Occupant.objects.filter(enclosure=data["enclosure"], is_active=True).exists():
                Occupant.objects.create(**data)
                self.stdout.write(f"Added occupant {data['name']} to {data['enclosure'].name}")

        self.stdout.write(self.style.SUCCESS("Seeding complete. Enclosure B2 is left empty on purpose."))
