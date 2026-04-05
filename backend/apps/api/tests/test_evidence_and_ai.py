from apps.ai_actions.models import GeneratedOutput
from apps.accounts.models import ClientProfile
from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.models import EvidenceItem
from apps.indicators.services import assign_project_indicator


class EvidenceAndAITest(ContractBaseTestCase):
    def test_multiple_evidence_items_are_allowed_for_one_project_indicator(self):
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
        for idx in range(2):
            response = self.client.post(
                "/api/evidence/",
                {
                    "project_indicator_id": project_indicator.id,
                    "title": f"Medication Policy v{idx + 1}",
                    "description": "Policy document",
                    "source_type": "URL",
                    "file_or_url": f"https://files.example/policy-v{idx + 1}.pdf",
                },
                format="json",
            )
            self.assertEqual(response.status_code, 201)
        self.assertEqual(EvidenceItem.objects.filter(project_indicator=project_indicator).count(), 2)

    def test_evidence_review_and_ai_generation_do_not_auto_mutate_status(self):
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
        create_response = self.client.post(
            "/api/evidence/",
            {
                "project_indicator_id": project_indicator.id,
                "title": "Medication Policy",
                "description": "Policy document",
                "source_type": "URL",
                "file_or_url": "https://files.example/policy.pdf",
            },
            format="json",
        )
        evidence_id = create_response.json()["data"]["id"]
        self.assertEqual(project_indicator.current_status, "NOT_STARTED")

        self.client.force_authenticate(user=self.reviewer)
        review_response = self.client.post(
            f"/api/evidence/{evidence_id}/review/",
            {
                "validity_status": "VALID",
                "completeness_status": "COMPLETE",
                "approval_status": "APPROVED",
                "review_notes": "Approved for use.",
            },
            format="json",
        )
        self.assertEqual(review_response.status_code, 200)

        self.client.force_authenticate(user=self.owner)
        ai_response = self.client.post(
            "/api/ai/generate/",
            {
                "project_indicator_id": project_indicator.id,
                "output_type": "GUIDANCE",
                "user_instruction": "Summarize the evidence gap.",
            },
            format="json",
        )
        self.assertEqual(ai_response.status_code, 201)
        project_indicator.refresh_from_db()
        self.assertEqual(project_indicator.current_status, "NOT_STARTED")
        self.assertFalse(project_indicator.is_met)
        self.assertEqual(GeneratedOutput.objects.filter(project_indicator=project_indicator).count(), 1)

    def test_ai_generation_applies_client_variable_replacement(self):
        profile = ClientProfile.objects.create(
            organization_name="Acme Health",
            address="Main Street",
            license_number="LIC-123",
            registration_number="REG-987",
            contact_person="A. Manager",
            department_names=["Quality"],
        )
        self.project.client_profile = profile
        self.project.save(update_fields=["client_profile"])
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
            "/api/ai/generate/",
            {
                "project_indicator_id": project_indicator.id,
                "output_type": "GUIDANCE",
                "user_instruction": "Include {{organization_name}} and {{license_number}} in the draft.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("Acme Health", response.json()["data"]["content"])
        self.assertIn("LIC-123", response.json()["data"]["content"])
