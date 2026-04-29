from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.indicators.models import ProjectIndicator
from apps.indicators.services import assign_project_indicator
from apps.recurring.services import approve_recurring_instance, submit_recurring_instance


class PrintPackTest(ContractBaseTestCase):
    def test_print_pack_returns_structured_sections_with_evidence(self):
        self.initialize_project()
        project_indicator = ProjectIndicator.objects.get(project=self.project, indicator=self.indicator)
        assign_project_indicator(
            project_indicator=project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )
        create_evidence_item(
            project_indicator=project_indicator,
            actor=self.owner,
            title="Policy copy",
            source_type="URL",
            file_or_url="https://files.example/policy.pdf",
            physical_location_type="BINDER",
            location_details="Binder A / Shelf 2",
            file_label="POL-001",
            is_physical_copy_available=True,
        )
        evidence = project_indicator.evidence_items.get(title="Policy copy")
        review_evidence_item(
            evidence_item=evidence,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
            review_notes="Approved for print pack test",
        )
        recurring_project_indicator = ProjectIndicator.objects.get(project=self.project, indicator=self.recurring_indicator)
        assign_project_indicator(
            project_indicator=recurring_project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )
        for instance in recurring_project_indicator.recurring_requirement.instances.all():
            submitted = submit_recurring_instance(
                recurring_instance=instance,
                actor=self.owner,
                text_content="Recurring print-pack evidence",
                notes="Submitted for print pack readiness",
            )
            approve_recurring_instance(
                recurring_instance=submitted,
                actor=self.reviewer,
                approval_status="APPROVED",
                notes="Approved for print pack readiness",
            )

        self.client.force_authenticate(user=self.owner)
        self.client.post(f"/api/project-indicators/{project_indicator.id}/start/", {"reason": "Start"}, format="json")
        self.client.post(
            f"/api/project-indicators/{project_indicator.id}/send-for-review/",
            {"reason": "Ready"},
            format="json",
        )
        self.client.force_authenticate(user=self.approver)
        self.client.post(f"/api/project-indicators/{project_indicator.id}/mark-met/", {"reason": "Met"}, format="json")

        self.client.force_authenticate(user=self.owner)
        self.client.post(f"/api/project-indicators/{recurring_project_indicator.id}/start/", {"reason": "Start"}, format="json")
        self.client.post(
            f"/api/project-indicators/{recurring_project_indicator.id}/send-for-review/",
            {"reason": "Ready"},
            format="json",
        )
        self.client.force_authenticate(user=self.approver)
        self.client.post(
            f"/api/project-indicators/{recurring_project_indicator.id}/mark-met/",
            {"reason": "Met"},
            format="json",
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/exports/projects/{self.project.id}/print-bundle/")
        self.assertEqual(response.status_code, 200)
        sections = response.json()["data"]["sections"]
        self.assertGreaterEqual(len(sections), 1)
        indicator_payload = sections[0]["standards"][0]["indicators"][0]
        self.assertIn("indicator_code", indicator_payload)
        self.assertIn("evidence_list", indicator_payload)
        self.assertEqual(indicator_payload["evidence_list"][0]["file_label"], "POL-001")
