from unittest.mock import patch

from apps.api.tests.base import ContractBaseTestCase
from apps.exports.services import export_eligibility_report
from apps.indicators.models import (
    ProjectIndicator,
    ProjectEvidenceRequirement,
    EvidenceRequirement,
    Indicator,
)
from apps.masters.choices import ProjectEvidenceRequirementStatusChoices


class ExportEligibilityReportTests(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.project_indicators = self.initialize_project()

    @patch("apps.exports.services.export_validation_warnings")
    def test_eligibility_happy_path(self, mock_warnings):
        # ARRANGE: Delete existing requirements, mock warnings, and create a clean state
        ProjectEvidenceRequirement.objects.filter(project=self.project).delete()
        mock_warnings.return_value = []
        indicator = Indicator.objects.first()
        project_indicator = ProjectIndicator.objects.get(project=self.project, indicator=indicator)
        mandatory_req = EvidenceRequirement.objects.create(
            indicator=indicator, title="Mandatory Test Requirement", mandatory=True
        )
        ProjectEvidenceRequirement.objects.create(
            project=self.project,
            project_indicator=project_indicator,
            framework_indicator=indicator,
            evidence_requirement=mandatory_req,
            status=ProjectEvidenceRequirementStatusChoices.APPROVED,
        )

        # ACT
        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        # ASSERT
        self.assertTrue(report["eligible"], msg=f"Should be eligible, but reasons are: {report.get('reasons')}")
        self.assertEqual(report["reasons"], [])

    def test_eligibility_blocked_by_mandatory_requirement(self):
        # ARRANGE: Delete existing requirements and create a clean state
        ProjectEvidenceRequirement.objects.filter(project=self.project).delete()
        indicator = Indicator.objects.first()
        project_indicator = ProjectIndicator.objects.get(project=self.project, indicator=indicator)
        mandatory_req = EvidenceRequirement.objects.create(
            indicator=indicator, title="Mandatory Test Requirement", mandatory=True
        )
        ProjectEvidenceRequirement.objects.create(
            project=self.project,
            project_indicator=project_indicator,
            framework_indicator=indicator,
            evidence_requirement=mandatory_req,
            status=ProjectEvidenceRequirementStatusChoices.MISSING, # The blocking status
        )

        # ACT
        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        # ASSERT
        self.assertFalse(report["eligible"])
        # There should be TWO reasons: the mandatory blocker itself, and the validation warning that comes from it.
        self.assertEqual(len(report["reasons"]), 2, msg=f"Expected 2 reasons, but got {len(report['reasons'])}: {report['reasons']}")
        self.assertIn("mandatory requirement(s) that are not yet Approved or Not Applicable", report["reasons"][0])
        self.assertIn("validation warning(s)", report["reasons"][1])


    @patch("apps.exports.services.export_validation_warnings")
    def test_eligibility_with_validation_warnings(self, mock_warnings):
        # ARRANGE: Ensure no mandatory blockers and mock the warnings
        ProjectEvidenceRequirement.objects.filter(project=self.project).delete()
        mock_warnings.return_value = [{"project_indicator_id": 1}]

        # ACT
        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        # ASSERT
        self.assertFalse(report["eligible"])
        self.assertEqual(len(report["reasons"]), 1)
        self.assertIn("Project has 1 validation warning(s)", report["reasons"][0])

    # == Obsolete Tests ==
    # The following tests are commented out because they validate logic against the
    # legacy `project_readiness` service, which was explicitly removed in this sprint.
    # The new logic is based on `calculate_project_evidence_readiness` which correctly
    # derives eligibility from the database state of mandatory requirements.

    # @patch("apps.exports.services.export_validation_warnings")
    # @patch("apps.exports.services_admin.project_readiness")
    # def test_eligibility_with_high_risk_indicators(self, mock_readiness, mock_warnings):
    #     ...

    # @patch("apps.exports.services.export_validation_warnings")
    # @patch("apps.exports.services_admin.project_readiness")
    # def test_eligibility_with_low_recurring_compliance(self, mock_readiness, mock_warnings):
    #     ...

    # @patch("apps.exports.services.export_validation_warnings")
    # @patch("apps.exports.services_admin.project_readiness")
    # def test_eligibility_with_multiple_reasons(self, mock_readiness, mock_warnings):
    #     ...

