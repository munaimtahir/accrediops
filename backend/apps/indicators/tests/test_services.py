from django.core.exceptions import PermissionDenied, ValidationError

from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.indicators.services import (assign_project_indicator,
                                      mark_project_indicator_met,
                                      send_project_indicator_for_review,
                                      start_project_indicator)
from apps.masters.choices import ProjectIndicatorStatusChoices


class MarkProjectIndicatorMetServiceTest(ContractBaseTestCase):
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

    def test_mark_met_success(self):
        # Add required evidence
        evidence_item = create_evidence_item(
            project_indicator=self.project_indicator,
            actor=self.owner,
            title="Medication Policy",
            description="Policy document",
            source_type="URL",
            file_or_url="https://files.example/policy.pdf",
        )
        review_evidence_item(
            evidence_item=evidence_item,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
        )

        # Transition status
        start_project_indicator(
            project_indicator=self.project_indicator, actor=self.owner, reason="start"
        )
        send_project_indicator_for_review(
            project_indicator=self.project_indicator, actor=self.owner, reason="review"
        )

        # Mark met
        result = mark_project_indicator_met(
            project_indicator=self.project_indicator,
            actor=self.approver,
            reason="All conditions met",
        )

        self.assertEqual(result.current_status, ProjectIndicatorStatusChoices.MET)
        self.assertTrue(result.is_met)
        self.assertTrue(result.is_finalized)

    def test_mark_met_permission_denied(self):
        with self.assertRaisesMessage(
            PermissionDenied, "Only the assigned APPROVER can perform this action."
        ):
            mark_project_indicator_met(
                project_indicator=self.project_indicator,
                actor=self.owner,
                reason="Unauthorized attempt",
            )

    def test_mark_met_readiness_fails(self):
        # Trying to mark MET without evidence should raise ValidationError
        with self.assertRaisesMessage(
            ValidationError,
            "Project indicator cannot be marked MET until readiness conditions pass.",
        ):
            mark_project_indicator_met(
                project_indicator=self.project_indicator,
                actor=self.approver,
                reason="Readiness fails",
            )
