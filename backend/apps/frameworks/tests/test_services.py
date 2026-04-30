from django.test import TestCase

from apps.api.tests.base import ContractBaseTestCase
from apps.frameworks.models import Area, Framework, Standard
from apps.frameworks.services import TEMPLATE_COLUMNS, framework_export_payload
from apps.indicators.models import Indicator


class TestFrameworkExportPayload(ContractBaseTestCase):
    def test_framework_export_payload_success(self):
        payload = framework_export_payload(self.framework)

        self.assertIn("framework", payload)
        self.assertEqual(payload["framework"]["id"], self.framework.id)
        self.assertEqual(payload["framework"]["name"], self.framework.name)
        self.assertEqual(
            payload["framework"]["description"], self.framework.description
        )

        self.assertIn("columns", payload)
        self.assertEqual(payload["columns"], TEMPLATE_COLUMNS)

        self.assertIn("rows", payload)
        self.assertEqual(payload["row_count"], 2)

        rows = payload["rows"]
        # Ensure it has exactly 2 indicators from the setup
        self.assertEqual(len(rows), 2)

        # Sort rows by indicator code to check easily
        rows_by_code = {row["indicator_code"]: row for row in rows}

        self.assertIn("IND-001", rows_by_code)
        self.assertIn("IND-002", rows_by_code)

        row1 = rows_by_code["IND-001"]
        self.assertEqual(row1["area_code"], self.area.code)
        self.assertEqual(row1["standard_code"], self.standard.code)
        self.assertEqual(row1["indicator_text"], self.indicator.text)
        self.assertEqual(row1["evidence_type"], self.indicator.evidence_type)
        self.assertFalse(row1["is_recurring"])

        row2 = rows_by_code["IND-002"]
        self.assertTrue(row2["is_recurring"])
        self.assertEqual(
            row2["recurrence_frequency"], self.recurring_indicator.recurrence_frequency
        )

        self.assertIn("export_csv", payload)
        csv_content = payload["export_csv"]
        self.assertIn("area_code,area_name", csv_content)
        self.assertIn("IND-001", csv_content)
        self.assertIn("IND-002", csv_content)

    def test_framework_export_payload_empty_framework(self):
        empty_framework = Framework.objects.create(
            name="Empty Framework", description="Empty"
        )
        payload = framework_export_payload(empty_framework)

        self.assertEqual(payload["row_count"], 0)
        self.assertEqual(len(payload["rows"]), 0)
        self.assertEqual(payload["framework"]["name"], "Empty Framework")

        # CSV should just have the headers
        csv_content = payload["export_csv"]
        header_line = ",".join(TEMPLATE_COLUMNS) + "\r\n"
        self.assertEqual(csv_content, header_line)

    def test_framework_export_payload_sorting(self):
        # Add another area, standard, and indicator to test sorting
        area2 = Area.objects.create(
            framework=self.framework,
            code="A0",
            name="Area 0",
            sort_order=0,
        )
        standard2 = Standard.objects.create(
            framework=self.framework,
            area=area2,
            code="S0",
            name="Standard 0",
            sort_order=0,
        )
        ind3 = Indicator.objects.create(
            framework=self.framework,
            area=area2,
            standard=standard2,
            code="IND-000",
            text="Text 0",
            sort_order=0,
        )

        # Add another indicator with a higher sort order in A1 S1
        ind4 = Indicator.objects.create(
            framework=self.framework,
            area=self.area,
            standard=self.standard,
            code="IND-003",
            text="Text 3",
            sort_order=3,
        )

        payload = framework_export_payload(self.framework)
        self.assertEqual(payload["row_count"], 4)

        rows = payload["rows"]
        # Expected sort order: area__sort_order, standard__sort_order, sort_order, code
        # A0 S0 IND-000 (0, 0, 0) -> should be first
        # A1 S1 IND-001 (1, 1, 1) -> second
        # A1 S1 IND-002 (1, 1, 2) -> third
        # A1 S1 IND-003 (1, 1, 3) -> fourth

        self.assertEqual(rows[0]["indicator_code"], "IND-000")
        self.assertEqual(rows[1]["indicator_code"], "IND-001")
        self.assertEqual(rows[2]["indicator_code"], "IND-002")
        self.assertEqual(rows[3]["indicator_code"], "IND-003")
