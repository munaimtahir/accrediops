from django.core.files.uploadedfile import SimpleUploadedFile

from apps.api.tests.base import ContractBaseTestCase
from apps.frameworks.models import Framework


class FrameworksApiTest(ContractBaseTestCase):
    def _csv_upload(self, file_name: str, csv_text: str):
        return SimpleUploadedFile(file_name, csv_text.encode("utf-8"), content_type="text/csv")

    def test_framework_list_returns_framework_rows(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/frameworks/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        rows = response.json()["data"]
        self.assertGreaterEqual(len(rows), 1)
        self.assertEqual(rows[0]["id"], self.framework.id)
        self.assertEqual(rows[0]["name"], self.framework.name)

    def test_framework_template_endpoint_returns_csv_and_columns(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/frameworks/template/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()["data"]
        self.assertIn("columns", payload)
        self.assertIn("required_columns", payload)
        self.assertIn("template_csv", payload)
        self.assertIn("area_code", payload["columns"])
        self.assertIn("indicator_code", payload["required_columns"])
        self.assertIn("area_code,area_name", payload["template_csv"])

    def test_framework_export_endpoint_returns_framework_rows(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/frameworks/{self.framework.id}/export/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()["data"]
        self.assertEqual(payload["framework"]["id"], self.framework.id)
        self.assertGreaterEqual(payload["row_count"], 2)
        self.assertTrue(payload["export_csv"].startswith("area_code,area_name"))

    def test_admin_framework_create_requires_admin_or_lead(self):
        self.client.force_authenticate(user=self.owner)
        denied = self.client.post(
            "/api/admin/frameworks/",
            {"name": "Should Fail", "description": ""},
            format="json",
        )
        self.assertEqual(denied.status_code, 403)

        self.client.force_authenticate(user=self.lead)
        allowed = self.client.post(
            "/api/admin/frameworks/",
            {"name": "Lead Created Framework", "description": "Lead access"},
            format="json",
        )
        self.assertEqual(allowed.status_code, 201)
        self.assertEqual(allowed.json()["data"]["name"], "Lead Created Framework")
        self.assertTrue(Framework.objects.filter(name="Lead Created Framework").exists())

    def test_admin_framework_import_from_csv_creates_hierarchy(self):
        self.client.force_authenticate(user=self.admin)
        # Use a fresh framework to avoid 409 Conflict
        framework = Framework.objects.create(name="Import Test FW")
        csv_text = "\n".join(
            [
                ",".join(
                    [
                        "area_code", "area_name", "area_description", "area_sort_order",
                        "standard_code", "standard_name", "standard_description", "standard_sort_order",
                        "indicator_code", "indicator_text", "required_evidence_description",
                        "evidence_type", "document_type", "fulfillment_guidance",
                        "is_recurring", "recurrence_frequency", "recurrence_mode",
                        "minimum_required_evidence_count", "reusable_template_allowed",
                        "evidence_reuse_policy", "is_active", "indicator_sort_order",
                    ]
                ),
                ",".join(
                    [
                        "A100", "Patient Safety", "Core controls", "1",
                        "S100", "Medication Governance", "Medication controls", "1",
                        "IND-100", "Evidence of medication safety governance", "Policy and logs",
                        "DOCUMENT_POLICY", "POLICY", "Maintain policy",
                        "false", "NONE", "EITHER", "1", "false", "NONE", "true", "1",
                    ]
                ),
            ]
        )
        response = self.client.post(
            "/api/admin/frameworks/import/",
            {
                "framework_id": framework.id,
                "file": self._csv_upload("import.csv", csv_text),
            },
        )
        self.assertEqual(response.status_code, 201)
        payload = response.json()["data"]
        self.assertEqual(payload["framework_id"], framework.id)
        self.assertEqual(payload["areas_count"], 1)
        self.assertEqual(payload["standards_count"], 1)
        self.assertEqual(payload["indicators_count"], 1)

    def test_admin_framework_validate_accepts_csv_input(self):
        self.client.force_authenticate(user=self.admin)
        csv_text = "\n".join(
            [
                "area_code,area_name,standard_code,standard_name,indicator_code,indicator_text",
                "A1,Area,STD1,Standard,IND-1,Indicator one",
                "A1,Area,STD1,Standard,IND-1,Duplicate",
            ]
        )
        response = self.client.post(
            "/api/admin/import/validate-framework/",
            {
                "framework_id": self.framework.id,
                "file": self._csv_upload("validate.csv", csv_text),
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()["data"]
        self.assertEqual(payload["framework_id"], self.framework.id)
        self.assertEqual(payload["file_name"], "validate.csv")
        self.assertEqual(payload["rows_processed"], 2)
        self.assertEqual(payload["normalized_rows"], 1)
        self.assertGreaterEqual(len(payload["errors"]), 1)

    def test_admin_framework_import_returns_not_found_for_invalid_framework(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            "/api/admin/frameworks/import/",
            {
                "framework_id": 999999,
                "file": self._csv_upload(
                    "invalid-framework.csv",
                    "area_code,area_name,standard_code,standard_name,indicator_code,indicator_text\n"
                    "A1,Area,STD1,Standard,IND-1,Indicator one",
                ),
            },
        )
        self.assertEqual(response.status_code, 404)

    def test_admin_framework_import_returns_conflict_for_framework_in_use(self):
        # self.framework is already used by self.project from base class
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            "/api/admin/frameworks/import/",
            {
                "framework_id": self.framework.id,
                "file": self._csv_upload(
                    "conflict.csv",
                    "area_code,area_name,standard_code,standard_name,indicator_code,indicator_text\n"
                    "A1,Area,STD1,Standard,IND-1,Indicator one",
                ),
            },
        )
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["error"]["code"], "CONFLICT")

    def test_framework_validate_and_import_handle_missing_headers_without_500(self):
        self.client.force_authenticate(user=self.admin)
        framework = Framework.objects.create(name="Missing Headers FW")
        invalid_csv = "area_code,area_name\nA1,Area only"

        validate_response = self.client.post(
            "/api/admin/import/validate-framework/",
            {
                "framework_id": framework.id,
                "file": self._csv_upload("missing-headers.csv", invalid_csv),
            },
        )
        self.assertEqual(validate_response.status_code, 200)
        validate_payload = validate_response.json()["data"]
        self.assertIn("missing_headers", validate_payload)
        self.assertGreaterEqual(len(validate_payload["missing_headers"]), 1)

        import_response = self.client.post(
            "/api/admin/frameworks/import/",
            {
                "framework_id": framework.id,
                "file": self._csv_upload("missing-headers.csv", invalid_csv),
            },
        )
        self.assertEqual(import_response.status_code, 400)
        self.assertEqual(import_response.json()["error"]["code"], "VALIDATION_ERROR")
