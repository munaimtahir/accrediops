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
)
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.masters.choices import (
    ProjectIndicatorStatusChoices,
    PriorityChoices,
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

    def test_reopen_requires_reason(self):
        with self.assertRaises(ValidationError):
            reopen_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.admin,
                reason="  "
            )
