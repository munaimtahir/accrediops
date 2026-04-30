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
from django.core.exceptions import ValidationError, PermissionDenied
from apps.api.tests.base import ContractBaseTestCase
from apps.indicators.services import (
    mark_project_indicator_met,
    assign_project_indicator,
    start_project_indicator,
    send_project_indicator_for_review,
    validate_project_indicator_readiness,
    reopen_project_indicator,
    update_project_indicator_working_state,
    add_project_indicator_comment,
    standards_progress,
    areas_progress,
)
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.masters.choices import (
    ProjectIndicatorStatusChoices,
    PriorityChoices,
    IndicatorCommentTypeChoices,
)

class IndicatorsServiceLayerTest(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.project_indicators = self.initialize_project()
        self.project_indicator = self.project_indicators["IND-001"]

    def _setup_assignments(self, pi=None):
        pi = pi or self.project_indicator
        assign_project_indicator(
            project_indicator=pi,
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
    def test_assign_project_indicator_success(self):
        updated_pi = assign_project_indicator(
            project_indicator=self.project_indicator,
            actor=self.admin,
            owner=self.owner,
            priority=PriorityChoices.HIGH,
        )
        self.assertEqual(updated_pi.owner, self.owner)
        self.assertEqual(updated_pi.priority, PriorityChoices.HIGH)

    def test_assign_project_indicator_invalid_role(self):
        # Trying to assign a user with role REVIEWER as OWNER
        with self.assertRaises(ValidationError) as cm:
            assign_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.admin,
                owner=self.reviewer,
            )
        self.assertIn("Assigned owner must have OWNER role.", str(cm.exception))

    def test_update_working_state_permission(self):
        self._setup_assignments()
        # Reviewer should not be able to update working state
        with self.assertRaises(PermissionDenied):
            update_project_indicator_working_state(
                project_indicator=self.project_indicator,
                actor=self.reviewer,
                notes="Breaking things",
            )

    def test_start_project_indicator_success(self):
        self._setup_assignments()
        updated_pi = start_project_indicator(
            project_indicator=self.project_indicator,
            actor=self.owner,
        )
        self.assertEqual(updated_pi.current_status, ProjectIndicatorStatusChoices.IN_PROGRESS)

    def test_start_project_indicator_permission_denied(self):
        self._setup_assignments()
        # Reviewer should not be able to start it
        with self.assertRaises(PermissionDenied):
            start_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.reviewer,
            )

    def test_send_for_review_no_work_fails(self):
        self._setup_assignments()
        # No notes or evidence yet
        with self.assertRaises(ValidationError) as cm:
            send_project_indicator_for_review(
                project_indicator=self.project_indicator,
                actor=self.owner,
            )
        self.assertIn("Indicator must have working notes or evidence before review.", str(cm.exception))

    def test_send_for_review_success_with_notes(self):
        self._setup_assignments()
        self.project_indicator.notes = "Work done"
        self.project_indicator.save()
        updated_pi = send_project_indicator_for_review(
            project_indicator=self.project_indicator,
            actor=self.owner,
        )
        self.assertEqual(updated_pi.current_status, ProjectIndicatorStatusChoices.UNDER_REVIEW)

    def test_send_for_review_permission_denied(self):
        self._setup_assignments()
        self.project_indicator.notes = "Work done"
        self.project_indicator.save()
        # Approver should not be able to send for review (only OWNER or Admin/Lead)
        with self.assertRaises(PermissionDenied):
            send_project_indicator_for_review(
                project_indicator=self.project_indicator,
                actor=self.approver,
            )

    def test_validate_readiness_conditions(self):
        self._setup_assignments()
        # Initially not ready
        readiness = validate_project_indicator_readiness(self.project_indicator)
        self.assertFalse(readiness["ready_for_met"])

        # Add evidence
        evidence_item = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Evidence",
            description="Test evidence",
            source_type="URL",
            file_or_url="https://example.com/test",
        )

        # Still not ready (not approved)
        readiness = validate_project_indicator_readiness(self.project_indicator)
        self.assertFalse(readiness["ready_for_met"])

        # Approve evidence
        review_evidence_item(
            evidence_item=evidence_item,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
        )

        # Now ready
        readiness = validate_project_indicator_readiness(self.project_indicator)
        self.assertTrue(readiness["ready_for_met"])

    def test_mark_project_indicator_met_success(self):
        self._setup_assignments()
        # Setup readiness
        evidence_item = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Evidence",
            description="Test evidence",
            source_type="URL",
            file_or_url="https://example.com/test",
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
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
        )

        updated_pi = mark_project_indicator_met(
            project_indicator=self.project_indicator,
            actor=self.approver,
            reason="Verified"
        )
        self.assertEqual(updated_pi.current_status, ProjectIndicatorStatusChoices.MET)
        self.assertTrue(updated_pi.is_met)

    def test_mark_project_indicator_met_permission_denied(self):
        self._setup_assignments()
        # Owner should not be able to mark it as MET
        with self.assertRaises(PermissionDenied):
            mark_project_indicator_met(
                project_indicator=self.project_indicator,
                actor=self.owner,
                reason="Owner trying to approve",
            )

    def test_mark_project_indicator_met_not_ready(self):
        self._setup_assignments()
        # No evidence approved yet
        with self.assertRaises(ValidationError) as cm:
            mark_project_indicator_met(
                project_indicator=self.project_indicator,
                actor=self.approver,
                reason="Not ready",
            )
        self.assertIn("Project indicator cannot be marked MET until readiness conditions pass.", str(cm.exception))

    def test_reopen_project_indicator_success(self):
        self._setup_assignments()
        # First mark it as MET
        self.project_indicator.current_status = ProjectIndicatorStatusChoices.MET
        self.project_indicator.is_met = True
        self.project_indicator.save()

        updated_pi = reopen_project_indicator(
            project_indicator=self.project_indicator,
            actor=self.admin,
            reason="Need more info"
        )
        self.assertEqual(updated_pi.current_status, ProjectIndicatorStatusChoices.IN_PROGRESS)
        self.assertFalse(updated_pi.is_met)

    def test_reopen_project_indicator_permission_denied(self):
        self._setup_assignments()
        # Lead should not be able to reopen (only Admin)
        with self.assertRaises(PermissionDenied):
            reopen_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.lead,
                reason="Lead trying to reopen",
            )

    def test_reopen_requires_reason(self):
        with self.assertRaises(ValidationError):
            reopen_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.admin,
                reason="  "
            )

    def test_add_project_indicator_comment_success(self):
        self._setup_assignments()
        comment = add_project_indicator_comment(
            project_indicator=self.project_indicator,
            actor=self.owner,
            comment_type=IndicatorCommentTypeChoices.WORKING,
            text="Initial thought",
        )
        self.assertEqual(comment.text, "Initial thought")
        self.assertEqual(comment.created_by, self.owner)

    def test_add_project_indicator_comment_permission_denied(self):
        self._setup_assignments()
        # Owner trying to add an approval comment
        with self.assertRaises(PermissionDenied):
            add_project_indicator_comment(
                project_indicator=self.project_indicator,
                actor=self.owner,
                comment_type=IndicatorCommentTypeChoices.APPROVAL,
                text="Trying to approve my own work",
            )

    def test_progress_aggregates(self):
        self._setup_assignments()
        # Initial state: 1 indicator, NOT_STARTED, 0 MET
        standards = standards_progress(self.project)
        self.assertEqual(len(standards), 1)
        self.assertEqual(standards[0]["total_indicators"], 2) # IND-001 and IND-002
        self.assertEqual(standards[0]["met_indicators"], 0)

        # Mark IND-001 as MET
        evidence_item = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Evidence",
            description="Test evidence",
            source_type="URL",
            file_or_url="https://example.com/test",
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
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
        )
        mark_project_indicator_met(
            project_indicator=self.project_indicator,
            actor=self.approver,
            reason="Verified"
        )

        standards = standards_progress(self.project)
        self.assertEqual(standards[0]["met_indicators"], 1)
        self.assertEqual(standards[0]["progress_percent"], 50.0)

        areas = areas_progress(self.project)
        self.assertEqual(len(areas), 1)
        self.assertEqual(areas[0]["total_standards"], 1)
        self.assertEqual(areas[0]["completed_standards"], 0) # Standard is only complete when all indicators are met
