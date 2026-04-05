from apps.api.tests.base import ContractBaseTestCase
from apps.indicators.services import assign_project_indicator


class PhysicalEvidenceTest(ContractBaseTestCase):
    def test_create_evidence_with_physical_tracking_fields(self):
        project_indicators = self.initialize_project()
        project_indicator = project_indicators["IND-001"]
        assign_project_indicator(
            project_indicator=project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            "/api/evidence/",
            {
                "project_indicator_id": project_indicator.id,
                "title": "Physical policy copy",
                "source_type": "URL",
                "file_or_url": "https://files.example/policy.pdf",
                "physical_location_type": "CABINET",
                "location_details": "Cabinet 4",
                "file_label": "CAB-004",
                "is_physical_copy_available": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        payload = response.json()["data"]
        self.assertEqual(payload["physical_location_type"], "CABINET")
        self.assertEqual(payload["file_label"], "CAB-004")
        self.assertTrue(payload["is_physical_copy_available"])
