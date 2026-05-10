from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User
from apps.frameworks.models import Area, Framework, Standard
from apps.indicators.models import (
    Indicator,
    ProjectIndicator,
    EvidenceRequirement,
    ProjectEvidenceRequirement,
)
from apps.projects.models import AccreditationProject
from apps.indicators.services import validate_project_indicator_readiness

class EvidenceRequirementTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="admin", role="ADMIN")
        self.framework = Framework.objects.create(name="Test Framework", description="Test Description")
        self.area = Area.objects.create(framework=self.framework, name="Area 1")
        self.standard = Standard.objects.create(framework=self.framework, area=self.area, name="Standard 1")
        self.indicator = Indicator.objects.create(
            framework=self.framework,
            area=self.area,
            standard=self.standard,
            code="IND-1",
            text="Indicator 1",
            minimum_required_evidence_count=0,
        )
        self.project = AccreditationProject.objects.create(
            name="Test Project",
            framework=self.framework,
            start_date=timezone.now().date(),
            target_date=timezone.now().date(),
        )
        self.project_indicator = ProjectIndicator.objects.create(
            project=self.project,
            indicator=self.indicator,
        )

    def test_missing_mandatory_blocks_readiness(self):
        # Create mandatory evidence requirement
        er1 = EvidenceRequirement.objects.create(
            framework_indicator=self.indicator,
            title="Policy Document",
            mandatory=True,
        )
        # Create project fulfillment for it
        per1 = ProjectEvidenceRequirement.objects.create(
            project=self.project,
            project_indicator=self.project_indicator,
            framework_indicator=self.indicator,
            evidence_requirement=er1,
            status="MISSING"
        )

        # Test readiness
        readiness = validate_project_indicator_readiness(self.project_indicator)
        self.assertEqual(readiness["missing_mandatory_requirements_count"], 1)
        self.assertFalse(readiness["ready_for_met"])

        # Approve the mandatory requirement
        per1.status = "APPROVED"
        per1.save()

        readiness2 = validate_project_indicator_readiness(self.project_indicator)
        self.assertEqual(readiness2["missing_mandatory_requirements_count"], 0)
