from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from apps.frameworks.models import Framework, Area, Standard
from apps.indicators.models import Indicator, EvidenceRequirement

class Command(BaseCommand):
    help = "Seed the database with the deterministic PHC LAB framework required for E2E tests."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("--- Seeding PHC LAB Framework ---"))

        # Create the Framework
        framework, _ = Framework.objects.update_or_create(
            name="PHC LAB",
            defaults={"description": "Punjab Healthcare Commission Laboratory Standards"}
        )

        # Create Areas
        area1, _ = Area.objects.update_or_create(
            framework=framework, code="A1", defaults={"name": "Access, Assessment, and Continuity of Care (AAC)"}
        )
        area2, _ = Area.objects.update_or_create(
            framework=framework, code="A2", defaults={"name": "Care of Patients (COP)"}
        )

        # Create Standards
        std1, _ = Standard.objects.update_or_create(
            framework=framework, area=area1, code="AAC.1", defaults={"name": "Services are accessible to the community."}
        )
        std2, _ = Standard.objects.update_or_create(
            framework=framework, area=area2, code="COP.1", defaults={"name": "Uniform care is provided to all patients."}
        )

        # Create Indicators
        ind1, _ = Indicator.objects.update_or_create(
            framework=framework, area=std1.area, standard=std1, code="IND-001",
            defaults={"text": "Service Timings are Displayed"}
        )
        ind2, _ = Indicator.objects.update_or_create(
            framework=framework, area=std1.area, standard=std1, code="IND-002",
            defaults={"text": "Emergency Contact Numbers are Displayed"}
        )
        ind3, _ = Indicator.objects.update_or_create(
            framework=framework, area=std2.area, standard=std2, code="IND-003",
            defaults={"text": "Patient Identification is Verified"}
        )

        # Create Evidence Requirements
        EvidenceRequirement.objects.update_or_create(
            indicator=ind1, title="Photograph of the entrance displaying service timings.",
            defaults={"mandatory": True}
        )
        EvidenceRequirement.objects.update_or_create(
            indicator=ind2, title="Photograph of displayed emergency contact numbers.",
            defaults={"mandatory": True}
        )
        EvidenceRequirement.objects.update_or_create(
            indicator=ind3, title="Policy document for patient identification.",
            defaults={"mandatory": True}
        )
        EvidenceRequirement.objects.update_or_create(
            indicator=ind3, title="Patient registration form sample.",
            defaults={"mandatory": False}
        )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded PHC LAB framework with {Indicator.objects.filter(framework=framework).count()} indicators."))
