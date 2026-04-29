from django.core.management.base import BaseCommand
from django.db import transaction

from apps.masters.models import MasterValue
import apps.masters.choices as choices


class Command(BaseCommand):
    help = "Seed database-backed master lists from codebase choices."

    def handle(self, *args, **options):
        # Gather all choices classes from choices.py
        choice_classes = [
            cls for name, cls in vars(choices).items()
            if isinstance(cls, type) and issubclass(cls, choices.models.TextChoices) and name.endswith('Choices')
        ]

        self.stdout.write(f"Found {len(choice_classes)} choice classes to sync.")

        with transaction.atomic():
            for choice_class in choice_classes:
                # The class name (e.g., RoleChoices) becomes the key (e.g., Role)
                key = choice_class.__name__.replace("Choices", "")
                
                # Delete existing values for this key to cleanly recreate them,
                # or we can update_or_create to preserve sorting if someone edited it.
                # Actually, the requirement is to seed them.
                
                for index, (code, label) in enumerate(choice_class.choices):
                    MasterValue.objects.update_or_create(
                        key=key,
                        code=code,
                        defaults={
                            "label": label,
                            "sort_order": index + 1,
                        }
                    )
                
                self.stdout.write(f"Synced {key} with {len(choice_class.choices)} values.")

        self.stdout.write(self.style.SUCCESS("Master values seeded successfully."))
