from unittest.mock import patch

from apps.api.tests.base import ContractBaseTestCase
from apps.exports.services import export_eligibility_report
from apps.indicators.models import ProjectIndicator


class ExportEligibilityReportTests(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.project_indicators = self.initialize_project()

    @patch("apps.exports.services.export_validation_warnings")
    @patch("apps.exports.services_admin.project_readiness")
    def test_eligibility_happy_path(self, mock_readiness, mock_warnings):
        # Setup mocks for a perfect project
        mock_readiness.return_value = {
            "high_risk_indicators": [],
            "recurring_compliance_score": 100,
        }
        mock_warnings.return_value = []

        # Mark all indicators as MET
        ProjectIndicator.objects.filter(project=self.project).update(current_status="MET")

        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        self.assertTrue(report["eligible"])
        self.assertEqual(report["reasons"], [])
        self.assertEqual(report["pending_indicator_count"], 0)
        self.assertEqual(report["warnings"], [])
        self.assertEqual(report["export_type"], "FULL_PRINT_PACK")

    @patch("apps.exports.services.export_validation_warnings")
    @patch("apps.exports.services_admin.project_readiness")
    def test_eligibility_with_pending_indicators(self, mock_readiness, mock_warnings):
        mock_readiness.return_value = {
            "high_risk_indicators": [],
            "recurring_compliance_score": 100,
        }
        mock_warnings.return_value = []

        # At least one indicator is pending (default status is usually NOT_STARTED or similar, not MET)
        pending_count = ProjectIndicator.objects.filter(project=self.project).exclude(current_status="MET").count()
        self.assertGreater(pending_count, 0)

        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        self.assertFalse(report["eligible"])
        self.assertEqual(report["pending_indicator_count"], pending_count)
        self.assertEqual(len(report["reasons"]), 1)
        self.assertIn(f"project has {pending_count} indicator(s) still pending approval or completion", report["reasons"][0])

    @patch("apps.exports.services.export_validation_warnings")
    @patch("apps.exports.services_admin.project_readiness")
    def test_eligibility_with_high_risk_indicators(self, mock_readiness, mock_warnings):
        mock_readiness.return_value = {
            "high_risk_indicators": [{"id": 1}],
            "recurring_compliance_score": 100,
        }
        mock_warnings.return_value = []

        # Mark all indicators as MET so pending count is 0
        ProjectIndicator.objects.filter(project=self.project).update(current_status="MET")

        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        self.assertFalse(report["eligible"])
        self.assertEqual(len(report["reasons"]), 1)
        self.assertIn("project has 1 critical high-risk indicator(s) pending", report["reasons"][0])

    @patch("apps.exports.services.export_validation_warnings")
    @patch("apps.exports.services_admin.project_readiness")
    def test_eligibility_with_low_recurring_compliance(self, mock_readiness, mock_warnings):
        mock_readiness.return_value = {
            "high_risk_indicators": [],
            "recurring_compliance_score": 95,
        }
        mock_warnings.return_value = []

        ProjectIndicator.objects.filter(project=self.project).update(current_status="MET")

        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        self.assertFalse(report["eligible"])
        self.assertEqual(len(report["reasons"]), 1)
        self.assertIn("recurring compliance is 95% and must be 100%", report["reasons"][0])

    @patch("apps.exports.services.export_validation_warnings")
    @patch("apps.exports.services_admin.project_readiness")
    def test_eligibility_with_validation_warnings(self, mock_readiness, mock_warnings):
        mock_readiness.return_value = {
            "high_risk_indicators": [],
            "recurring_compliance_score": 100,
        }
        mock_warnings.return_value = [{"project_indicator_id": 1}, {"project_indicator_id": 2}]

        ProjectIndicator.objects.filter(project=self.project).update(current_status="MET")

        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        self.assertFalse(report["eligible"])
        self.assertEqual(len(report["reasons"]), 1)
        self.assertIn("approval completeness is not satisfied for 2 indicator(s)", report["reasons"][0])

    @patch("apps.exports.services.export_validation_warnings")
    @patch("apps.exports.services_admin.project_readiness")
    def test_eligibility_with_multiple_reasons(self, mock_readiness, mock_warnings):
        mock_readiness.return_value = {
            "high_risk_indicators": [{"id": 1}],
            "recurring_compliance_score": 95,
        }
        mock_warnings.return_value = [{"project_indicator_id": 1}]

        # Keep pending indicators active (do not mark as MET)
        pending_count = ProjectIndicator.objects.filter(project=self.project).exclude(current_status="MET").count()
        self.assertGreater(pending_count, 0)

        report = export_eligibility_report(self.project, "FULL_PRINT_PACK")

        self.assertFalse(report["eligible"])
        self.assertEqual(len(report["reasons"]), 4) # pending, high risk, low recurring compliance, validation warnings

        reasons_str = " ".join(report["reasons"])
        self.assertIn(f"project has {pending_count} indicator(s) still pending approval or completion", reasons_str)
        self.assertIn("project has 1 critical high-risk indicator(s) pending", reasons_str)
        self.assertIn("recurring compliance is 95% and must be 100%", reasons_str)
        self.assertIn("approval completeness is not satisfied for 1 indicator(s)", reasons_str)
