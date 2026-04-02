from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.indicators.services import assign_project_indicator


class MarkMetAndProgressTest(ContractBaseTestCase):
    def test_mark_met_requires_approved_evidence(self):
        project_indicators = self.initialize_project()
        project_indicator = project_indicators["IND-001"]
        assign_project_indicator(
            project_indicator=project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )

        evidence_item = create_evidence_item(
            project_indicator=project_indicator,
            actor=self.owner,
            title="Medication Policy",
            description="Policy document",
            source_type="URL",
            file_or_url="https://files.example/policy.pdf",
        )

        self.client.force_authenticate(user=self.approver)
        failed_response = self.client.post(
            f"/api/project-indicators/{project_indicator.id}/mark-met/",
            {"reason": "Attempt before approval."},
            format="json",
        )
        self.assertEqual(failed_response.status_code, 400)

        review_evidence_item(
            evidence_item=evidence_item,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
            review_notes="Approved",
        )
        self.client.force_authenticate(user=self.owner)
        self.client.post(
            f"/api/project-indicators/{project_indicator.id}/start/",
            {"reason": "Owner started work."},
            format="json",
        )
        self.client.post(
            f"/api/project-indicators/{project_indicator.id}/send-for-review/",
            {"reason": "Ready for review."},
            format="json",
        )

        self.client.force_authenticate(user=self.approver)
        success_response = self.client.post(
            f"/api/project-indicators/{project_indicator.id}/mark-met/",
            {"reason": "Approved evidence is now present."},
            format="json",
        )
        self.assertEqual(success_response.status_code, 200)
        self.assertEqual(success_response.json()["data"]["current_status"], "MET")

    def test_standard_and_area_progress_aggregate_from_project_indicators(self):
        project_indicators = self.initialize_project()
        primary = project_indicators["IND-001"]
        recurring = project_indicators["IND-002"]
        for project_indicator in (primary, recurring):
            assign_project_indicator(
                project_indicator=project_indicator,
                actor=self.admin,
                owner=self.owner,
                reviewer=self.reviewer,
                approver=self.approver,
            )

        evidence_item = create_evidence_item(
            project_indicator=primary,
            actor=self.owner,
            title="Medication Policy",
            description="Policy document",
            source_type="URL",
            file_or_url="https://files.example/policy.pdf",
        )
        review_evidence_item(
            evidence_item=evidence_item,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
        )
        self.client.force_authenticate(user=self.owner)
        self.client.post(
            f"/api/project-indicators/{primary.id}/start/",
            {"reason": "Owner started work."},
            format="json",
        )
        self.client.post(
            f"/api/project-indicators/{primary.id}/send-for-review/",
            {"reason": "Ready for review."},
            format="json",
        )
        self.client.force_authenticate(user=self.approver)
        self.client.post(
            f"/api/project-indicators/{primary.id}/mark-met/",
            {"reason": "Primary indicator satisfied."},
            format="json",
        )

        standards_response = self.client.get(f"/api/projects/{self.project.id}/standards-progress/")
        self.assertEqual(standards_response.status_code, 200)
        standards = standards_response.json()["data"]
        self.assertEqual(len(standards), 1)
        self.assertEqual(standards[0]["total_indicators"], 2)
        self.assertEqual(standards[0]["met_indicators"], 1)
        self.assertEqual(standards[0]["progress_percent"], 50.0)

        areas_response = self.client.get(f"/api/projects/{self.project.id}/areas-progress/")
        self.assertEqual(areas_response.status_code, 200)
        areas = areas_response.json()["data"]
        self.assertEqual(len(areas), 1)
        self.assertEqual(areas[0]["total_standards"], 1)
        self.assertEqual(areas[0]["completed_standards"], 0)
