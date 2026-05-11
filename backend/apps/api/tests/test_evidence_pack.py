from django.utils import timezone
from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.indicators.models import ProjectIndicator
from apps.indicators.services import assign_project_indicator
from apps.recurring.services import approve_recurring_instance, submit_recurring_instance
from apps.ai_actions.models import DocumentDraft
from apps.ai_actions.models.document_draft import DocumentDraftKindChoices


class EvidencePackTest(ContractBaseTestCase):
    def test_evidence_pack_returns_structured_sections_with_enhanced_data(self):
        project_indicators_map = self.initialize_project()
        all_project_indicators = project_indicators_map.values()

        project_indicator_for_drafts = None

        for pi in all_project_indicators:
            # Assignees for all project_indicators
            assign_project_indicator(
                project_indicator=pi,
                actor=self.admin,
                owner=self.owner,
                reviewer=self.reviewer,
                approver=self.approver,
            )

            if pi.indicator.code == self.indicator.code:
                project_indicator_for_drafts = pi

            if pi.indicator.is_recurring:
                # Submit and approve all instances to ensure 100% recurring compliance
                for instance in pi.recurring_requirement.instances.all():
                    submitted = submit_recurring_instance(
                        recurring_instance=instance,
                        actor=self.owner,
                        text_content=f"Recurring evidence for {pi.indicator.code}",
                        notes="Approved for full compliance",
                    )
                    approve_recurring_instance(
                        recurring_instance=submitted,
                        actor=self.reviewer,
                        approval_status="APPROVED",
                        notes="Approved for full compliance",
                    )
            else:
                # Create dummy evidence to allow marking as MET for non-recurring indicators
                dummy_evidence_item = create_evidence_item(
                    project_indicator=pi,
                    actor=self.owner,
                    title=f"Dummy evidence for {pi.indicator.code}",
                    source_type="TEXT_NOTE",
                    text_content="Dummy content",
                )
                review_evidence_item(
                    evidence_item=dummy_evidence_item,
                    actor=self.reviewer,
                    validity_status="VALID",
                    completeness_status="COMPLETE",
                    approval_status="APPROVED",
                    review_notes="Approved for full project compliance",
                )

            # Mark as MET for all indicators
            self.client.force_authenticate(user=self.owner)
            self.client.post(f"/api/project-indicators/{pi.id}/start/", {"reason": "Start"}, format="json")
            self.client.post(
                f"/api/project-indicators/{pi.id}/send-for-review/",
                {"reason": "Ready"},
                format="json",
            )
            self.client.force_authenticate(user=self.approver)
            self.client.post(f"/api/project-indicators/{pi.id}/mark-met/", {"reason": "Met"}, format="json")

        self.assertIsNotNone(project_indicator_for_drafts, "Project indicator for drafts was not found")

        # Create and approve evidence for the specific project_indicator (IND-001) for testing AI drafts and evidence list
        evidence_item = create_evidence_item(
            project_indicator=project_indicator_for_drafts,
            actor=self.owner,
            title="Policy copy for evidence pack",
            source_type="URL",
            file_or_url="https://files.example/policy_pack.pdf",
            physical_location_type="BINDER",
            location_details="Binder X / Shelf 1",
            file_label="POL-PACK-001",
            is_physical_copy_available=True,
        )
        review_evidence_item(
            evidence_item=evidence_item,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
            review_notes="Approved for evidence pack test",
        )

        # Create a document draft for project_indicator (advisory)
        advisory_draft = DocumentDraft.objects.create(
            project=self.project,
            project_indicator=project_indicator_for_drafts,
            framework=self.framework,
            indicator=self.indicator,
            title="Advisory Draft for Pack",
            draft_kind=DocumentDraftKindChoices.POLICY,
            document_type="POLICY",
            draft_content="This is an advisory AI-generated draft content.",
            source="AI",
            review_status="HUMAN_REVIEW_REQUIRED",
            generated_by=self.admin,
            generated_at=timezone.now(),
        )

        # Create a promoted document draft for project_indicator
        promoted_draft = DocumentDraft.objects.create(
            project=self.project,
            project_indicator=project_indicator_for_drafts,
            framework=self.framework,
            indicator=self.indicator,
            title="Promoted Draft for Pack",
            draft_kind=DocumentDraftKindChoices.SOP,
            document_type="SOP",
            draft_content="This is a promoted AI-generated draft content.",
            source="AI",
            review_status="PROMOTED_TO_EVIDENCE",
            promoted_evidence=evidence_item,  # Link to the evidence item
            promoted_at=timezone.now(),
            generated_by=self.admin,
            generated_at=timezone.now(),
        )

        # Now, make the API call after ensuring everything is MET
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/exports/projects/{self.project.id}/print-bundle/")
        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        # --- Test Project Summary ---
        project_summary = data["project_summary"]
        self.assertEqual(project_summary["name"], self.project.name)
        self.assertEqual(project_summary["framework_name"], self.framework.name)
        self.assertIn("date_generated", project_summary)
        self.assertIn("overall_readiness_score", project_summary)
        self.assertEqual(project_summary["client_info"]["organization_name"], self.client_profile.organization_name)
        self.assertEqual(project_summary["total_indicators"], len(all_project_indicators)) # All should be counted
        self.assertEqual(project_summary["met_indicators"], len(all_project_indicators)) # All should be MET
        self.assertEqual(project_summary["partial_indicators"], 0)
        self.assertEqual(project_summary["missing_indicators"], 0)
        self.assertEqual(project_summary["under_review_indicators"], 0)
        self.assertEqual(project_summary["approved_indicators"], len(all_project_indicators)) # All should be approved
        self.assertEqual(project_summary["final_evidence_ready_indicators"], len(all_project_indicators))

        # --- Test Sections (Areas -> Standards -> Indicators) ---
        sections = data["sections"]
        self.assertGreaterEqual(len(sections), 1)
        first_section = sections[0]
        self.assertIn("name", first_section)
        self.assertGreaterEqual(len(first_section["standards"]), 1)
        first_standard = first_section["standards"][0]
        self.assertIn("name", first_standard)
        self.assertGreaterEqual(len(first_standard["indicators"]), 1)

        # Find our project_indicator_for_drafts (IND-001) in the sections
        found_pi_data = None
        for sec in sections:
            for std in sec["standards"]:
                for pi_data in std["indicators"]:
                    if pi_data["project_indicator_id"] == project_indicator_for_drafts.id:
                        found_pi_data = pi_data
                        break
                if found_pi_data:
                    break
            if found_pi_data:
                break
        self.assertIsNotNone(found_pi_data, "Project indicator for drafts (IND-001) not found in print bundle sections")

        # --- Test Indicator-level Data ---
        self.assertEqual(found_pi_data["indicator_code"], self.indicator.code)
        self.assertEqual(found_pi_data["status"], project_indicator_for_drafts.current_status)
        self.assertEqual(found_pi_data["assigned_owner"], self.owner.get_full_name())
        self.assertEqual(found_pi_data["assigned_reviewer"], self.reviewer.get_full_name())
        self.assertEqual(found_pi_data["assigned_approver"], self.approver.get_full_name())
        self.assertIn("readiness_summary", found_pi_data)
        self.assertEqual(found_pi_data["readiness_summary"]["risk_level"], "LOW") # All should be low risk

        # --- Test Evidence List and Reviewer Details ---
        evidence_list = found_pi_data["evidence_list"]
        self.assertGreaterEqual(len(evidence_list), 1)
        found_evidence = None
        for ev in evidence_list:
            if ev["id"] == evidence_item.id:
                found_evidence = ev
                break
        self.assertIsNotNone(found_evidence, "Evidence item not found in indicator's evidence list")
        self.assertEqual(found_evidence["file_label"], "POL-PACK-001")
        self.assertEqual(found_evidence["approval_status"], "APPROVED")
        self.assertEqual(found_evidence["reviewed_by"], self.reviewer.get_full_name())
        self.assertIn("reviewed_at", found_evidence)

        # --- Test AI Drafts (Advisory and Promoted) ---
        ai_drafts_advisory = found_pi_data["ai_drafts_advisory"]
        promoted_ai_drafts = found_pi_data["promoted_ai_drafts"]
        self.assertEqual(len(ai_drafts_advisory), 1)
        self.assertEqual(ai_drafts_advisory[0]["id"], advisory_draft.id)
        self.assertEqual(ai_drafts_advisory[0]["review_status"], "HUMAN_REVIEW_REQUIRED")
        self.assertIn("draft_content_preview", ai_drafts_advisory[0])

        self.assertEqual(len(promoted_ai_drafts), 1)
        self.assertEqual(promoted_ai_drafts[0]["id"], promoted_draft.id)
        self.assertEqual(promoted_ai_drafts[0]["review_status"], "PROMOTED_TO_EVIDENCE")
        self.assertEqual(promoted_ai_drafts[0]["promoted_evidence_id"], evidence_item.id)

        # --- Test Consolidated Lists ---
        consolidated_lists = data["consolidated_lists"]
        self.assertIn("missing_evidence", consolidated_lists)
        self.assertIn("partial_evidence", consolidated_lists)
        self.assertIn("ai_drafts_for_review", consolidated_lists)

        self.assertEqual(len(consolidated_lists["missing_evidence"]), 0)
        self.assertEqual(len(consolidated_lists["partial_evidence"]), 0)
        
        found_ai_draft_for_review = False
        for ai_draft in consolidated_lists["ai_drafts_for_review"]:
            if ai_draft["id"] == advisory_draft.id:
                found_ai_draft_for_review = True
                self.assertEqual(ai_draft["review_status"], "HUMAN_REVIEW_REQUIRED")
                break
        self.assertTrue(found_ai_draft_for_review, "Advisory AI draft not found in consolidated list")

