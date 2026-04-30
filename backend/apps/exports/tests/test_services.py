from datetime import timedelta
from unittest.mock import patch

from django.utils import timezone

from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.exports.services import export_validation_warnings
from apps.indicators.services import assign_project_indicator
from apps.recurring.services import generate_recurring_instances


class ExportValidationWarningsTests(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.project_indicators = self.initialize_project()
        self.primary = self.project_indicators["IND-001"]
        self.recurring = self.project_indicators["IND-002"]

        for item in (self.primary, self.recurring):
            assign_project_indicator(
                project_indicator=item,
                actor=self.admin,
                owner=self.owner,
                reviewer=self.reviewer,
                approver=self.approver,
            )

    def test_no_warnings_for_perfect_project(self):
        # Make IND-001 perfect (1 approved evidence)
        evidence = create_evidence_item(
            project_indicator=self.primary,
            actor=self.owner,
            title="Good Policy",
            source_type="URL",
            file_or_url="https://example.com/good.pdf",
        )
        review_evidence_item(
            evidence_item=evidence,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
        )

        # We need IND-002 (recurring) to be perfect as well, or just delete it for simplicity
        self.recurring.delete()

        warnings = export_validation_warnings(self.project)
        self.assertEqual(len(warnings), 0)

    def test_warning_for_missing_evidence(self):
        # IND-001 has no evidence
        self.recurring.delete()
        warnings = export_validation_warnings(self.project)
        self.assertEqual(len(warnings), 1)
        self.assertEqual(warnings[0]["project_indicator_id"], self.primary.id)
        self.assertEqual(warnings[0]["missing_evidence_count"], 1)
        self.assertEqual(warnings[0]["unapproved_evidence_count"], 0)

    def test_warning_for_unapproved_evidence(self):
        evidence = create_evidence_item(
            project_indicator=self.primary,
            actor=self.owner,
            title="Good Policy",
            source_type="URL",
            file_or_url="https://example.com/good.pdf",
        )
        # Not yet approved (UNDER_REVIEW by default)

        self.recurring.delete()
        warnings = export_validation_warnings(self.project)
        self.assertEqual(len(warnings), 1)
        self.assertEqual(warnings[0]["project_indicator_id"], self.primary.id)
        self.assertEqual(warnings[0]["missing_evidence_count"], 1)
        self.assertEqual(warnings[0]["unapproved_evidence_count"], 1)

    def test_warning_for_overdue_recurring_instance(self):
        # Setup perfect primary
        evidence = create_evidence_item(
            project_indicator=self.primary,
            actor=self.owner,
            title="Good Policy",
            source_type="URL",
            file_or_url="https://example.com/good.pdf",
        )
        review_evidence_item(
            evidence_item=evidence,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
        )

        # Setup overdue recurring requirement
        requirement = self.recurring.recurring_requirement
        generate_recurring_instances(
            recurring_requirement=requirement,
            actor=self.admin,
            until_date=self.project.target_date,
        )
        instance = requirement.instances.first()

        # Force overdue date
        past_date = timezone.localdate() - timedelta(days=5)
        type(instance).objects.filter(id=instance.id).update(
            due_date=past_date, status="PENDING"
        )

        warnings = export_validation_warnings(self.project)
        self.assertEqual(len(warnings), 1)
        self.assertEqual(warnings[0]["project_indicator_id"], self.recurring.id)
        self.assertEqual(warnings[0]["overdue_recurring_count"], 1)
