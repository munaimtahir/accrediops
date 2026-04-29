import json
from unittest.mock import patch

from django.test import override_settings
from django.utils import timezone

from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.models import EvidenceItem
from apps.indicators.models import Indicator, ProjectIndicator
from apps.masters.choices import ClassificationReviewStatusChoices


class IndicatorClassificationTests(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.admin)

    def _mock_ai_payload(self, confidence="HIGH"):
        return json.dumps(
            [
                {
                    "indicator_id": self.indicator.id,
                    "indicator_code": self.indicator.code,
                    "evidence_type": "DOCUMENT_POLICY",
                    "ai_assistance_level": "FULL_AI",
                    "evidence_frequency": "ONE_TIME",
                    "primary_action_required": "GENERATE_DOCUMENT",
                    "classification_confidence": confidence,
                    "classification_reason": "Policy can be drafted and reviewed.",
                },
                {
                    "indicator_id": self.recurring_indicator.id,
                    "indicator_code": self.recurring_indicator.code,
                    "evidence_type": "RECORD_REGISTER",
                    "ai_assistance_level": "PARTIAL_AI",
                    "evidence_frequency": "RECURRING",
                    "primary_action_required": "MAINTAIN_LOG",
                    "classification_confidence": confidence,
                    "classification_reason": "Requires ongoing records.",
                },
            ]
        )

    def test_new_indicators_default_to_unclassified(self):
        indicator = Indicator.objects.create(
            framework=self.framework,
            area=self.area,
            standard=self.standard,
            code="IND-003",
            text="Physical signage is displayed",
        )
        self.assertEqual(indicator.classification_review_status, "UNCLASSIFIED")
        self.assertEqual(indicator.classification_version, 0)

    def test_classification_fields_validate_allowed_choices(self):
        self.indicator.evidence_type = "NOT_ALLOWED"
        with self.assertRaises(Exception):
            self.indicator.full_clean()

    @override_settings(AI_PROVIDER="gemini", AI_MODEL="gemini-2.5-flash", AI_DEMO_MODE=False, GEMINI_API_KEY="test")
    def test_run_ai_classification_saves_results(self):
        with patch("apps.ai_actions.services.classification._call_gemini_api", return_value=self._mock_ai_payload()):
            response = self.client.post(
                f"/api/admin/frameworks/{self.framework.id}/classify-indicators/",
                {"mode": "unclassified_only"},
                format="json",
            )
        self.assertEqual(response.status_code, 200)
        self.indicator.refresh_from_db()
        self.assertEqual(self.indicator.evidence_type, "DOCUMENT_POLICY")
        self.assertEqual(self.indicator.ai_assistance_level, "FULL_AI")
        self.assertEqual(self.indicator.evidence_frequency, "ONE_TIME")
        self.assertEqual(self.indicator.primary_action_required, "GENERATE_DOCUMENT")
        self.assertEqual(self.indicator.classification_confidence, "HIGH")
        self.assertEqual(self.indicator.classification_review_status, "AI_SUGGESTED")
        self.assertIsNotNone(self.indicator.classified_by_ai_at)
        self.assertEqual(self.indicator.classification_version, 1)

    @override_settings(AI_PROVIDER="gemini", AI_MODEL="gemini-2.5-flash", AI_DEMO_MODE=False, GEMINI_API_KEY="test")
    def test_low_confidence_becomes_needs_review(self):
        with patch("apps.ai_actions.services.classification._call_gemini_api", return_value=self._mock_ai_payload("LOW")):
            self.client.post(f"/api/admin/frameworks/{self.framework.id}/classify-indicators/", {}, format="json")
        self.indicator.refresh_from_db()
        self.assertEqual(self.indicator.classification_confidence, "LOW")
        self.assertEqual(self.indicator.classification_review_status, "NEEDS_REVIEW")

    @override_settings(AI_PROVIDER="gemini", AI_MODEL="gemini-2.5-flash", AI_DEMO_MODE=False, GEMINI_API_KEY="test")
    def test_invalid_gemini_json_safely_defaults_to_manual_review(self):
        with patch("apps.ai_actions.services.classification._call_gemini_api", return_value="```json\nnot-json\n```"):
            response = self.client.post(
                f"/api/admin/frameworks/{self.framework.id}/classify-indicators/",
                {},
                format="json",
            )
        self.assertEqual(response.status_code, 200)
        self.indicator.refresh_from_db()
        self.assertEqual(self.indicator.evidence_type, "MANUAL_REVIEW")
        self.assertEqual(self.indicator.primary_action_required, "MANUAL_DECISION")
        self.assertEqual(self.indicator.classification_review_status, "NEEDS_REVIEW")

    @override_settings(AI_PROVIDER="gemini", AI_MODEL="gemini-2.5-flash", AI_DEMO_MODE=False, GEMINI_API_KEY="test")
    def test_unclassified_only_does_not_overwrite_reviewed_indicators(self):
        self.indicator.classification_review_status = ClassificationReviewStatusChoices.HUMAN_REVIEWED
        self.indicator.evidence_type = "PHYSICAL_FACILITY"
        self.indicator.save()
        with patch("apps.ai_actions.services.classification._call_gemini_api", return_value=self._mock_ai_payload()):
            self.client.post(f"/api/admin/frameworks/{self.framework.id}/classify-indicators/", {}, format="json")
        self.indicator.refresh_from_db()
        self.assertEqual(self.indicator.evidence_type, "PHYSICAL_FACILITY")
        self.assertEqual(self.indicator.classification_review_status, "HUMAN_REVIEWED")

    @override_settings(AI_PROVIDER="gemini", AI_MODEL="gemini-2.5-flash", AI_DEMO_MODE=False, GEMINI_API_KEY="test")
    def test_manually_changed_indicators_protected_by_default(self):
        self.indicator.classification_review_status = ClassificationReviewStatusChoices.MANUALLY_CHANGED
        self.indicator.evidence_type = "PHYSICAL_FACILITY"
        self.indicator.save()
        with patch("apps.ai_actions.services.classification._call_gemini_api", return_value=self._mock_ai_payload()):
            self.client.post(
                f"/api/admin/frameworks/{self.framework.id}/classify-indicators/",
                {"mode": "force_all", "confirm_force": True},
                format="json",
            )
        self.indicator.refresh_from_db()
        self.assertEqual(self.indicator.evidence_type, "PHYSICAL_FACILITY")

    @override_settings(AI_PROVIDER="gemini", AI_MODEL="gemini-2.5-flash", AI_DEMO_MODE=False, GEMINI_API_KEY="test")
    def test_force_overwrite_requires_explicit_flag_and_admin(self):
        self.indicator.classification_review_status = ClassificationReviewStatusChoices.HUMAN_REVIEWED
        self.indicator.evidence_type = "PHYSICAL_FACILITY"
        self.indicator.save()
        self.client.force_authenticate(user=self.lead)
        response = self.client.post(
            f"/api/admin/frameworks/{self.framework.id}/classify-indicators/",
            {"mode": "force_all", "confirm_force": True, "overwrite_human_reviewed": True},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.client.force_authenticate(user=self.admin)
        with patch("apps.ai_actions.services.classification._call_gemini_api", return_value=self._mock_ai_payload()):
            response = self.client.post(
                f"/api/admin/frameworks/{self.framework.id}/classify-indicators/",
                {"mode": "force_all", "confirm_force": True, "overwrite_human_reviewed": True},
                format="json",
            )
        self.assertEqual(response.status_code, 200)
        self.indicator.refresh_from_db()
        self.assertEqual(self.indicator.evidence_type, "DOCUMENT_POLICY")

    def test_manual_update_endpoint_sets_manual_or_reviewed_metadata(self):
        response = self.client.patch(
            f"/api/admin/indicators/{self.indicator.id}/classification/",
            {
                "evidence_type": "LICENSE_CERTIFICATE",
                "ai_assistance_level": "NO_AI",
                "evidence_frequency": "ONE_TIME",
                "primary_action_required": "OBTAIN_CERTIFICATE",
                "classification_reason": "Official certificate required.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.indicator.refresh_from_db()
        self.assertEqual(self.indicator.classification_review_status, "MANUALLY_CHANGED")
        self.assertEqual(self.indicator.classification_reviewed_by, self.admin)
        self.assertIsNotNone(self.indicator.classification_reviewed_at)

        response = self.client.patch(
            f"/api/admin/indicators/{self.indicator.id}/classification/",
            {"classification_review_status": "HUMAN_REVIEWED"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.indicator.refresh_from_db()
        self.assertEqual(self.indicator.classification_review_status, "HUMAN_REVIEWED")

    def test_bulk_approve_sets_human_reviewed(self):
        response = self.client.post(
            f"/api/admin/frameworks/{self.framework.id}/classification/bulk-review/",
            {"indicator_ids": [self.indicator.id, self.recurring_indicator.id], "action": "approve"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.indicator.refresh_from_db()
        self.recurring_indicator.refresh_from_db()
        self.assertEqual(self.indicator.classification_review_status, "HUMAN_REVIEWED")
        self.assertEqual(self.recurring_indicator.classification_review_status, "HUMAN_REVIEWED")

    def test_non_admin_non_lead_cannot_run_classification(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(f"/api/admin/frameworks/{self.framework.id}/classify-indicators/", {}, format="json")
        self.assertEqual(response.status_code, 403)

    @override_settings(AI_PROVIDER="gemini", AI_MODEL="gemini-2.5-flash", AI_DEMO_MODE=False, GEMINI_API_KEY="test")
    def test_classification_does_not_mutate_project_indicator_status_or_create_evidence(self):
        project_indicators = self.initialize_project()
        project_indicator = project_indicators["IND-001"]
        before_status = project_indicator.current_status
        before_evidence_count = EvidenceItem.objects.count()
        with patch("apps.ai_actions.services.classification._call_gemini_api", return_value=self._mock_ai_payload()):
            self.client.post(f"/api/admin/frameworks/{self.framework.id}/classify-indicators/", {}, format="json")
        project_indicator.refresh_from_db()
        self.assertEqual(project_indicator.current_status, before_status)
        self.assertEqual(EvidenceItem.objects.count(), before_evidence_count)

    def test_filtering_by_classification_fields_uses_saved_values(self):
        self.indicator.evidence_type = "DOCUMENT_POLICY"
        self.indicator.ai_assistance_level = "FULL_AI"
        self.indicator.evidence_frequency = "ONE_TIME"
        self.indicator.primary_action_required = "GENERATE_DOCUMENT"
        self.indicator.classification_review_status = "AI_SUGGESTED"
        self.indicator.classification_confidence = "HIGH"
        self.indicator.classified_by_ai_at = timezone.now()
        self.indicator.save()
        response = self.client.get(
            f"/api/admin/frameworks/{self.framework.id}/classification/",
            {
                "evidence_type": "DOCUMENT_POLICY",
                "ai_assistance_level": "FULL_AI",
                "evidence_frequency": "ONE_TIME",
                "primary_action_required": "GENERATE_DOCUMENT",
                "classification_review_status": "AI_SUGGESTED",
                "classification_confidence": "HIGH",
            },
        )
        self.assertEqual(response.status_code, 200)
        results = response.json()["data"]["results"]
        self.assertEqual([row["id"] for row in results], [self.indicator.id])

    def test_dashboard_worklist_classification_filter(self):
        self.initialize_project()
        self.indicator.evidence_type = "DOCUMENT_POLICY"
        self.indicator.ai_assistance_level = "FULL_AI"
        self.indicator.save()
        response = self.client.get("/api/dashboard/worklist/", {"evidence_type": "DOCUMENT_POLICY", "ai_assistance_level": "FULL_AI"})
        self.assertEqual(response.status_code, 200)
        results = response.json()["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["indicator_id"], self.indicator.id)
