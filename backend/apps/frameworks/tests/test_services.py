import csv
import io

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

        # Parse and validate the CSV precisely
        stream = io.StringIO(csv_content)
        reader = csv.DictReader(stream)
        csv_rows = list(reader)

        self.assertEqual(len(csv_rows), 2)
        self.assertEqual(reader.fieldnames, TEMPLATE_COLUMNS)

        # Verify content mapping for each row
        csv_by_code = {row["indicator_code"]: row for row in csv_rows}

        csv_row1 = csv_by_code["IND-001"]
        self.assertEqual(csv_row1["area_code"], self.area.code)
        self.assertEqual(csv_row1["standard_code"], self.standard.code)
        self.assertEqual(csv_row1["indicator_text"], self.indicator.text)
        self.assertEqual(csv_row1["evidence_type"], self.indicator.evidence_type)
        self.assertEqual(csv_row1["is_recurring"], "False")

        csv_row2 = csv_by_code["IND-002"]
        self.assertEqual(csv_row2["is_recurring"], "True")
        self.assertEqual(
            csv_row2["recurrence_frequency"],
            self.recurring_indicator.recurrence_frequency,
        )

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
        # We start with setup containing A1 (order=1), S1 (order=1), IND-001 (order=1), IND-002 (order=2)

        # Add a new area to test area__sort_order
        area0 = Area.objects.create(
            framework=self.framework,
            code="A0",
            name="Area 0",
            sort_order=0,
        )
        standard_a0_s0 = Standard.objects.create(
            framework=self.framework,
            area=area0,
            code="S0",
            name="Standard 0",
            sort_order=0,
        )
        Indicator.objects.create(
            framework=self.framework,
            area=area0,
            standard=standard_a0_s0,
            code="IND-000",
            text="Text 0",
            sort_order=0,
        )

        # Add a new standard in A1 to test standard__sort_order
        standard_a1_s0 = Standard.objects.create(
            framework=self.framework,
            area=self.area,
            code="S0-A1",
            name="Standard 0 for A1",
            sort_order=0,
        )
        Indicator.objects.create(
            framework=self.framework,
            area=self.area,
            standard=standard_a1_s0,
            code="IND-A1-S0-1",
            text="Text A1 S0",
            sort_order=1,
        )

        # Add indicators in A1, S1 with identical sort_order but different codes to test code tie-breaker
        Indicator.objects.create(
            framework=self.framework,
            area=self.area,
            standard=self.standard,
            code="IND-001B",
            text="Text 1B",
            sort_order=1,
        )
        Indicator.objects.create(
            framework=self.framework,
            area=self.area,
            standard=self.standard,
            code="IND-001A",
            text="Text 1A",
            sort_order=1,
        )

        payload = framework_export_payload(self.framework)
        self.assertEqual(payload["row_count"], 6)

        rows = payload["rows"]
        # Expected sort order: area__sort_order, standard__sort_order, sort_order, code
        # 1. area0 (0), standard_a0_s0 (0), IND-000 (0)
        # 2. area1 (1), standard_a1_s0 (0), IND-A1-S0-1 (1)
        # 3. area1 (1), standard1 (1), IND-001 (1) - Note: codes are IND-001, IND-001A, IND-001B
        # 4. area1 (1), standard1 (1), IND-001A (1)
        # 5. area1 (1), standard1 (1), IND-001B (1)
        # 6. area1 (1), standard1 (1), IND-002 (2)

        self.assertEqual(rows[0]["indicator_code"], "IND-000")
        self.assertEqual(rows[1]["indicator_code"], "IND-A1-S0-1")
        self.assertEqual(rows[2]["indicator_code"], "IND-001")
        self.assertEqual(rows[3]["indicator_code"], "IND-001A")
        self.assertEqual(rows[4]["indicator_code"], "IND-001B")
        self.assertEqual(rows[5]["indicator_code"], "IND-002")
