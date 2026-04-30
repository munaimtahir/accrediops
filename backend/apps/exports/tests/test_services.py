from django.core.exceptions import PermissionDenied
from django.test import TestCase
from unittest.mock import patch, MagicMock

from apps.api.tests.base import ContractBaseTestCase
from apps.exports.services import enforce_export_eligibility

class EnforceExportEligibilityTests(ContractBaseTestCase):
    def test_enforce_export_eligibility_eligible(self):
        self.initialize_project()

        with patch("apps.exports.services.export_eligibility_report") as mock_report:
            mock_report.return_value = {
                "eligible": True,
                "reasons": []
            }

            result = enforce_export_eligibility(self.project, "excel")

            self.assertEqual(result, mock_report.return_value)
            mock_report.assert_called_once_with(self.project, "excel")

    def test_enforce_export_eligibility_blocked(self):
        self.initialize_project()

        with patch("apps.exports.services.export_eligibility_report") as mock_report:
            mock_report.return_value = {
                "eligible": False,
                "reasons": ["Missing required indicators.", "Risk level is high."]
            }

            with self.assertRaises(PermissionDenied) as context:
                enforce_export_eligibility(self.project, "print-bundle")

            self.assertEqual(str(context.exception), "Export blocked: Missing required indicators. Risk level is high.")
            mock_report.assert_called_once_with(self.project, "print-bundle")
