from datetime import timedelta

from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.indicators.services import (assign_project_indicator,
                                      validate_project_indicator_readiness)
from apps.masters.choices import (EvidenceApprovalStatusChoices,
                                  EvidenceCompletenessStatusChoices,
                                  EvidenceValidityStatusChoices,
                                  RecurringInstanceStatusChoices)
from django.core.exceptions import ValidationError
from django.utils import timezone


class ValidateProjectIndicatorReadinessTests(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        project_indicators = self.initialize_project()
        self.project_indicator = project_indicators["IND-001"]
        self.recurring_project_indicator = project_indicators["IND-002"]

        assign_project_indicator(
            project_indicator=self.project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )

        assign_project_indicator(
            project_indicator=self.recurring_project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )

    def test_no_evidence_not_ready(self):
        readiness = validate_project_indicator_readiness(self.project_indicator)
        self.assertEqual(readiness["approved_evidence_count"], 0)
        self.assertEqual(readiness["total_current_evidence_count"], 0)
        self.assertEqual(readiness["minimum_required_evidence_count"], self.project_indicator.indicator.minimum_required_evidence_count)
        self.assertFalse(readiness["has_minimum_required_evidence"])
        self.assertFalse(readiness["all_current_evidence_approved"])
        self.assertTrue(readiness["no_rejected_current_evidence"])
        self.assertFalse(readiness["ready_for_met"])

    def test_unapproved_evidence_not_ready(self):
        create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Policy",
            source_type="URL",
            file_or_url="https://example.com",
        )
        readiness = validate_project_indicator_readiness(self.project_indicator)
        self.assertEqual(readiness["approved_evidence_count"], 0)
        self.assertEqual(readiness["total_current_evidence_count"], 1)
        self.assertFalse(readiness["has_minimum_required_evidence"])
        self.assertFalse(readiness["all_current_evidence_approved"])
        self.assertFalse(readiness["ready_for_met"])

    def test_approved_evidence_ready(self):
        evidence_item = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Policy",
            source_type="URL",
            file_or_url="https://example.com",
        )
        review_evidence_item(
            evidence_item=evidence_item,
            actor=self.reviewer,
            validity_status=EvidenceValidityStatusChoices.VALID,
            completeness_status=EvidenceCompletenessStatusChoices.COMPLETE,
            approval_status=EvidenceApprovalStatusChoices.APPROVED,
        )
        readiness = validate_project_indicator_readiness(self.project_indicator)
        self.assertEqual(readiness["approved_evidence_count"], 1)
        self.assertEqual(readiness["total_current_evidence_count"], 1)
        self.assertTrue(readiness["has_minimum_required_evidence"])
        self.assertTrue(readiness["all_current_evidence_approved"])
        self.assertTrue(readiness["no_rejected_current_evidence"])
        self.assertTrue(readiness["ready_for_met"])

    def test_rejected_evidence_not_ready(self):
        evidence_item = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Policy",
            source_type="URL",
            file_or_url="https://example.com",
        )
        review_evidence_item(
            evidence_item=evidence_item,
            actor=self.reviewer,
            validity_status=EvidenceValidityStatusChoices.INVALID,
            completeness_status=EvidenceCompletenessStatusChoices.INCOMPLETE,
            approval_status=EvidenceApprovalStatusChoices.REJECTED,
        )
        readiness = validate_project_indicator_readiness(self.project_indicator)
        self.assertEqual(readiness["approved_evidence_count"], 0)
        self.assertEqual(readiness["total_current_evidence_count"], 1)
        self.assertEqual(readiness["rejected_current_evidence_count"], 1)
        self.assertFalse(readiness["has_minimum_required_evidence"])
        self.assertFalse(readiness["all_current_evidence_approved"])
        self.assertFalse(readiness["no_rejected_current_evidence"])
        self.assertFalse(readiness["ready_for_met"])

    def test_overdue_recurring_not_ready(self):
        from apps.recurring.models import RecurringEvidenceInstance

        evidence_item = create_evidence_item(
            project_indicator=self.recurring_project_indicator,
            actor=self.owner,
            title="Log",
            source_type="URL",
            file_or_url="https://example.com",
        )
        review_evidence_item(
            evidence_item=evidence_item,
            actor=self.reviewer,
            validity_status=EvidenceValidityStatusChoices.VALID,
            completeness_status=EvidenceCompletenessStatusChoices.COMPLETE,
            approval_status=EvidenceApprovalStatusChoices.APPROVED,
        )

        # In ContractBaseTestCase, project is created with start_date=today-1 and target_date=today
        # initialize_project generates instances until today
        # So we can just find one of the instances and set its due_date to yesterday and status to PENDING

        instance = (
            self.recurring_project_indicator.recurring_requirement.instances.first()
        )
        today = timezone.localdate()
        instance.due_date = today - timedelta(days=1)
        instance.status = RecurringInstanceStatusChoices.PENDING
        instance.save()

        readiness = validate_project_indicator_readiness(
            self.recurring_project_indicator
        )
        self.assertEqual(readiness["overdue_recurring_instances_count"], 1)
        self.assertFalse(readiness["recurring_requirements_clear"])
        self.assertFalse(readiness["ready_for_met"])
