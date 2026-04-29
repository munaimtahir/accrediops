"""Tests for document drafting and promotion."""

from unittest.mock import patch
from django.utils import timezone

from apps.ai_actions.models import DocumentDraft, AIUsageLog
from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.models import EvidenceItem
from apps.indicators.services import assign_project_indicator


class DocumentDraftingAndPromotionTest(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.project_indicators = self.initialize_project()
        self.project_indicator = self.project_indicators["IND-001"]
        assign_project_indicator(
            project_indicator=self.project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )

    def test_generate_framework_draft(self):
        self.client.force_authenticate(user=self.admin)
        indicator = self.project_indicator.indicator
        
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "AI drafted policy content."
            
            response = self.client.post(
                f"/api/admin/queues/document-generation/{indicator.id}/generate-draft/",
                {"user_instruction": "Test instruction"},
                format="json",
            )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()["data"]
        self.assertEqual(data["indicator"], indicator.id)
        self.assertIsNone(data["project"])
        self.assertEqual(data["review_status"], "DRAFT")
        self.assertIn("AI drafted policy content", data["draft_content"])
        
        # Verify AI usage log
        self.assertEqual(AIUsageLog.objects.filter(feature="Document Drafting").count(), 1)

    def test_generate_project_specific_draft(self):
        self.client.force_authenticate(user=self.admin)
        indicator = self.project_indicator.indicator
        
        with patch("apps.ai_actions.services.generation._call_gemini_api") as mock_gemini:
            mock_gemini.return_value = "AI drafted project policy content."
            
            response = self.client.post(
                f"/api/admin/queues/document-generation/{indicator.id}/generate-draft/",
                {
                    "user_instruction": "Test project instruction",
                    "project_id": self.project.id,
                    "project_indicator_id": self.project_indicator.id
                },
                format="json",
            )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()["data"]
        self.assertEqual(data["project"], self.project.id)
        self.assertEqual(data["project_indicator_id"], self.project_indicator.id)

    def test_update_draft_status_to_reviewed(self):
        draft = DocumentDraft.objects.create(
            framework=self.project.framework,
            indicator=self.project_indicator.indicator,
            title="Initial Draft",
            draft_content="Some content",
            generated_by=self.admin,
        )
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.patch(
            f"/api/admin/document-drafts/{draft.id}/",
            {"review_status": "HUMAN_REVIEWED", "title": "Updated Title"},
            format="json",
        )
        
        self.assertEqual(response.status_code, 200)
        draft.refresh_from_db()
        self.assertEqual(draft.review_status, "HUMAN_REVIEWED")
        self.assertEqual(draft.title, "Updated Title")
        self.assertEqual(draft.last_edited_by, self.admin)

    def test_promote_draft_to_evidence(self):
        draft = DocumentDraft.objects.create(
            framework=self.project.framework,
            indicator=self.project_indicator.indicator,
            title="Ready Draft",
            draft_content="Final policy content.",
            generated_by=self.admin,
        )
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.post(
            f"/api/admin/document-drafts/{draft.id}/promote-to-evidence/",
            {
                "project_id": self.project.id,
                "project_indicator_id": self.project_indicator.id,
                "evidence_title": "Promoted Evidence",
                "evidence_type": "POLICY",
                "document_type": "POLICY",
                "final_filename": "policy_v1.pdf",
                "notes": "Promoted from AI draft."
            },
            format="json",
        )
        
        self.assertEqual(response.status_code, 200)
        draft.refresh_from_db()
        self.assertEqual(draft.review_status, "PROMOTED_TO_EVIDENCE")
        self.assertIsNotNone(draft.promoted_evidence)
        
        evidence = draft.promoted_evidence
        self.assertEqual(evidence.title, "Promoted Evidence")
        self.assertEqual(evidence.text_content, "Final policy content.")
        self.assertEqual(evidence.source_type, "GENERATED")
        self.assertEqual(evidence.uploaded_by, self.admin)
        self.assertEqual(evidence.project_indicator, self.project_indicator)

    def test_cannot_promote_already_promoted_draft(self):
        evidence = EvidenceItem.objects.create(
            project_indicator=self.project_indicator,
            title="Existing Evidence",
            source_type="GENERATED"
        )
        draft = DocumentDraft.objects.create(
            framework=self.project.framework,
            indicator=self.project_indicator.indicator,
            title="Promoted Draft",
            draft_content="Content",
            review_status="PROMOTED_TO_EVIDENCE",
            promoted_evidence=evidence,
            generated_by=self.admin,
        )
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.post(
            f"/api/admin/document-drafts/{draft.id}/promote-to-evidence/",
            {
                "project_id": self.project.id,
                "project_indicator_id": self.project_indicator.id,
                "evidence_title": "Trying again",
                "evidence_type": "POLICY",
                "document_type": "POLICY",
            },
            format="json",
        )
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("already been promoted", response.json()["error"]["message"])
