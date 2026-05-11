from django.test import override_settings

from apps.ai_actions.models import AIUsageLog, DocumentDraft
from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.models import EvidenceItem


class FrameworkDocumentationAITest(ContractBaseTestCase):
    @override_settings(AI_DEMO_MODE=True)
    def test_generate_single_indicator_sop_draft_demo_mode(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/admin/frameworks/{self.framework.id}/documentation/generate-draft/",
            {
                "scope": "single_indicator",
                "kind": "SOP",
                "indicator_id": self.indicator.id,
                "user_instruction": "Keep it short.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()["data"]
        draft = DocumentDraft.objects.get(pk=data["id"])
        self.assertTrue(draft.is_advisory)
        self.assertEqual(draft.review_status, "HUMAN_REVIEW_REQUIRED")
        self.assertEqual(draft.draft_kind, "SOP")
        self.assertEqual(draft.framework_id, self.framework.id)
        self.assertEqual(draft.indicator_id, self.indicator.id)
        self.assertEqual(draft.related_indicators.count(), 1)
        self.assertIn("AI Advisory Disclaimer", draft.draft_content)
        self.assertEqual(EvidenceItem.objects.count(), 0)
        self.assertEqual(AIUsageLog.objects.filter(feature="Framework Documentation").count(), 1)

    @override_settings(AI_DEMO_MODE=True)
    def test_generate_selected_indicators_checklist_demo_mode(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/admin/frameworks/{self.framework.id}/documentation/generate-draft/",
            {
                "scope": "selected_indicators",
                "kind": "CHECKLIST",
                "indicator_ids": [self.indicator.id, self.recurring_indicator.id],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        draft = DocumentDraft.objects.get(pk=response.json()["data"]["id"])
        self.assertEqual(draft.related_indicators.count(), 2)
        self.assertIn("CHECKLIST", draft.title)

    @override_settings(AI_DEMO_MODE=False, AI_PROVIDER="gemini", AI_MODEL="gemini-1.5-flash", GEMINI_API_KEY="")
    def test_generate_framework_documentation_missing_key_returns_clear_error(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/admin/frameworks/{self.framework.id}/documentation/generate-draft/",
            {
                "scope": "single_indicator",
                "kind": "POLICY",
                "indicator_id": self.indicator.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("GEMINI_API_KEY", response.json()["error"]["message"])

