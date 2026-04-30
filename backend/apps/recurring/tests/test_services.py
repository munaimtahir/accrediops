from django.core.exceptions import ValidationError

from apps.api.tests.base import ContractBaseTestCase
from apps.audit.models import AuditEvent
from apps.masters.choices import (RecurrenceFrequencyChoices,
                                  RecurrenceModeChoices)
from apps.recurring.models import RecurringRequirement
from apps.recurring.services import \
    ensure_recurring_requirement_for_project_indicator


class EnsureRecurringRequirementTests(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        indicators = self.initialize_project()
        self.non_recurring_pi = indicators[self.indicator.code]
        self.recurring_pi = indicators[self.recurring_indicator.code]

    def test_ensure_recurring_requirement_raises_error_for_non_recurring(self):
        with self.assertRaisesMessage(
            ValidationError, "Project indicator is not recurring."
        ):
            ensure_recurring_requirement_for_project_indicator(
                project_indicator=self.non_recurring_pi, actor=self.admin
            )

    def test_ensure_recurring_requirement_creates_new(self):
        # We delete all existing requirements and audit events to test creation again
        RecurringRequirement.objects.all().delete()
        AuditEvent.objects.all().delete()
        initial_audit_count = AuditEvent.objects.count()

        requirement = ensure_recurring_requirement_for_project_indicator(
            project_indicator=self.recurring_pi, actor=self.admin
        )

        self.assertIsInstance(requirement, RecurringRequirement)
        self.assertEqual(requirement.project_indicator, self.recurring_pi)
        self.assertEqual(requirement.frequency, RecurrenceFrequencyChoices.DAILY)
        self.assertEqual(requirement.mode, RecurrenceModeChoices.EITHER)
        self.assertEqual(requirement.start_date, self.recurring_pi.project.start_date)
        self.assertEqual(requirement.end_date, self.recurring_pi.project.target_date)
        self.assertEqual(
            requirement.instructions, self.recurring_pi.indicator.fulfillment_guidance
        )
        self.assertEqual(
            requirement.expected_title_template, self.recurring_pi.indicator.code
        )

        # Verify audit event
        self.assertEqual(AuditEvent.objects.count(), initial_audit_count + 1)
        audit_event = AuditEvent.objects.latest("timestamp")
        self.assertEqual(audit_event.event_type, "recurring.requirement_created")
        self.assertEqual(audit_event.actor, self.admin)
        self.assertEqual(audit_event.object_type, "RecurringRequirement")
        self.assertEqual(audit_event.object_id, str(requirement.pk))

    def test_ensure_recurring_requirement_returns_existing(self):
        # Already created during initialize_project()
        requirement1 = RecurringRequirement.objects.get(
            project_indicator=self.recurring_pi
        )

        AuditEvent.objects.all().delete()
        initial_audit_count = AuditEvent.objects.count()

        # Create it again
        requirement2 = ensure_recurring_requirement_for_project_indicator(
            project_indicator=self.recurring_pi, actor=self.admin
        )

        self.assertEqual(requirement1, requirement2)

        # Ensure no new audit event
        self.assertEqual(AuditEvent.objects.count(), initial_audit_count)
