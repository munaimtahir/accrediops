from django.core.exceptions import ValidationError

from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.models import EvidenceItem
from apps.evidence.services import create_evidence_item, review_evidence_item, update_evidence_item
from apps.indicators.services import assign_project_indicator


class EvidenceServiceTest(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        project_indicators = self.initialize_project()
        self.project_indicator = project_indicators["IND-001"]
        assign_project_indicator(
            project_indicator=self.project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )

    def test_create_evidence_requires_file_or_url_for_url_source(self):
        with self.assertRaises(ValidationError):
            create_evidence_item(
                project_indicator=self.project_indicator,
                actor=self.owner,
                title="Missing URL",
                source_type="URL",
                file_or_url="",
            )

    def test_create_evidence_requires_text_content_for_text_note_source(self):
        with self.assertRaises(ValidationError):
            create_evidence_item(
                project_indicator=self.project_indicator,
                actor=self.owner,
                title="Missing note",
                source_type="TEXT_NOTE",
                text_content="",
            )

    def test_create_evidence_versions_and_marks_previous_not_current(self):
        v1 = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Medication Policy",
            source_type="URL",
            file_or_url="https://files.example/policy-v1.pdf",
        )
        v2 = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Medication Policy",
            source_type="URL",
            file_or_url="https://files.example/policy-v2.pdf",
        )
        v1.refresh_from_db()
        self.assertEqual(v1.version_no, 1)
        self.assertFalse(v1.is_current)
        self.assertEqual(v2.version_no, 2)
        self.assertTrue(v2.is_current)

    def test_update_reviewed_evidence_creates_new_version(self):
        evidence = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Medication Policy",
            source_type="URL",
            file_or_url="https://files.example/policy-v1.pdf",
        )
        reviewed = review_evidence_item(
            evidence_item=evidence,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
            review_notes="ok",
        )
        self.assertEqual(reviewed.id, evidence.id)
        updated = update_evidence_item(
            evidence_item=reviewed,
            actor=self.owner,
            file_or_url="https://files.example/policy-v2.pdf",
            notes="updated after review",
        )
        self.assertNotEqual(updated.id, evidence.id)
        reviewed.refresh_from_db()
        self.assertFalse(reviewed.is_current)
        self.assertTrue(updated.is_current)
        self.assertEqual(updated.version_no, 2)
        self.assertEqual(updated.file_or_url, "https://files.example/policy-v2.pdf")

    def test_review_evidence_rejects_invalid_status_values(self):
        evidence = EvidenceItem.objects.create(
            project_indicator=self.project_indicator,
            title="Evidence",
            source_type="URL",
            file_or_url="https://files.example/x.pdf",
            uploaded_by=self.owner,
        )
        with self.assertRaises(ValidationError):
            review_evidence_item(
                evidence_item=evidence,
                actor=self.reviewer,
                validity_status="NOT_A_STATUS",
                completeness_status="COMPLETE",
                approval_status="APPROVED",
            )

