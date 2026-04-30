from datetime import timedelta

from django.core.exceptions import PermissionDenied, ValidationError
from django.utils import timezone

from apps.api.tests.base import ContractBaseTestCase
from apps.audit.models import AuditEvent
from apps.indicators.services import assign_project_indicator
from apps.masters.choices import PriorityChoices


class AssignProjectIndicatorTests(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.indicators = self.initialize_project()
        self.project_indicator = self.indicators["IND-001"]

    def test_assign_project_indicator_success(self):
        due_date = timezone.localdate() + timedelta(days=14)
        notes = "Assignment notes"

        result = assign_project_indicator(
            project_indicator=self.project_indicator,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
            priority=PriorityChoices.HIGH,
            due_date=due_date,
            notes=notes,
        )

        self.assertEqual(result.owner, self.owner)
        self.assertEqual(result.reviewer, self.reviewer)
        self.assertEqual(result.approver, self.approver)
        self.assertEqual(result.priority, PriorityChoices.HIGH)
        self.assertEqual(result.due_date, due_date)
        self.assertEqual(result.notes, notes)
        self.assertEqual(result.last_updated_by, self.admin)

        # Verify audit log
        audit_event = AuditEvent.objects.filter(
            object_type="ProjectIndicator",
            object_id=str(self.project_indicator.id),
            event_type="project_indicator.assignment_updated",
        ).first()
        self.assertIsNotNone(audit_event)
        self.assertEqual(audit_event.actor, self.admin)

    def test_assign_project_indicator_invalid_priority(self):
        with self.assertRaisesMessage(ValidationError, "Unsupported priority."):
            assign_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.admin,
                priority="INVALID_PRIORITY",
            )

    def test_assign_project_indicator_invalid_roles(self):
        with self.assertRaisesMessage(
            ValidationError, "Assigned owner must have OWNER role."
        ):
            assign_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.admin,
                owner=self.approver,  # Not an owner
            )

        with self.assertRaisesMessage(
            ValidationError, "Assigned reviewer must have REVIEWER role."
        ):
            assign_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.admin,
                reviewer=self.owner,  # Not a reviewer
            )

        with self.assertRaisesMessage(
            ValidationError, "Assigned approver must have APPROVER role."
        ):
            assign_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.admin,
                approver=self.owner,  # Not an approver
            )

    def test_assign_project_indicator_permission_denied(self):
        with self.assertRaisesMessage(
            PermissionDenied, "Only ADMIN or LEAD can perform this action."
        ):
            assign_project_indicator(
                project_indicator=self.project_indicator,
                actor=self.owner,  # Owner cannot assign
                owner=self.owner,
            )
