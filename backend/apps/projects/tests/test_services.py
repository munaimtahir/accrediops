from apps.api.tests.base import ContractBaseTestCase
from apps.indicators.models import ProjectIndicator
from apps.masters.choices import PriorityChoices, ProjectStatusChoices
from apps.projects.services import clone_project
from django.core.exceptions import PermissionDenied


class CloneProjectServiceTest(ContractBaseTestCase):
    def test_clone_project_success(self):
        self.initialize_project()

        source_pi = ProjectIndicator.objects.get(
            project=self.project, indicator=self.indicator
        )
        source_pi.owner = self.owner
        source_pi.reviewer = self.reviewer
        source_pi.approver = self.approver
        source_pi.priority = PriorityChoices.HIGH
        source_pi.notes = "These are some notes that shouldn't be cloned"
        source_pi.save()

        source_recurring_pi = ProjectIndicator.objects.get(
            project=self.project, indicator=self.recurring_indicator
        )
        source_req = source_recurring_pi.recurring_requirement
        source_req.expected_title_template = "Custom Expected Title"
        source_req.save()

        self.project.notes = "These are some project notes that should be cloned"
        self.project.save()

        cloned_project = clone_project(
            source_project=self.project,
            actor=self.admin,
            name="Cloned Project Test",
            client_name="Cloned Client Test",
        )

        self.assertEqual(cloned_project.name, "Cloned Project Test")
        self.assertEqual(cloned_project.client_name, "Cloned Client Test")
        self.assertEqual(
            cloned_project.accrediting_body_name, self.project.accrediting_body_name
        )
        self.assertEqual(cloned_project.framework, self.project.framework)
        self.assertEqual(cloned_project.status, ProjectStatusChoices.DRAFT)
        self.assertEqual(cloned_project.start_date, self.project.start_date)
        self.assertEqual(cloned_project.target_date, self.project.target_date)
        self.assertEqual(cloned_project.notes, self.project.notes)
        self.assertEqual(cloned_project.created_by, self.admin)
        self.assertEqual(cloned_project.client_profile, self.project.client_profile)

        cloned_pis = ProjectIndicator.objects.filter(project=cloned_project)
        self.assertEqual(cloned_pis.count(), 2)

        cloned_pi = cloned_pis.get(indicator=self.indicator)
        self.assertEqual(cloned_pi.owner, self.owner)
        self.assertEqual(cloned_pi.reviewer, self.reviewer)
        self.assertEqual(cloned_pi.approver, self.approver)
        self.assertEqual(cloned_pi.priority, PriorityChoices.HIGH)
        self.assertEqual(cloned_pi.notes, "")
        self.assertEqual(cloned_pi.due_date, cloned_project.target_date)

        cloned_recurring_pi = cloned_pis.get(indicator=self.recurring_indicator)
        cloned_req = cloned_recurring_pi.recurring_requirement
        self.assertEqual(cloned_req.expected_title_template, "Custom Expected Title")
        self.assertEqual(cloned_req.frequency, source_req.frequency)
        self.assertEqual(cloned_req.mode, source_req.mode)
        self.assertEqual(cloned_req.instructions, source_req.instructions)

    def test_clone_project_permission_denied(self):
        with self.assertRaisesMessage(
            PermissionDenied, "Only ADMIN or LEAD can perform this action."
        ):
            clone_project(
                source_project=self.project,
                actor=self.owner,
                name="Cloned Project Test",
                client_name="Cloned Client Test",
            )

    def test_clone_project_with_lead_actor(self):
        cloned_project = clone_project(
            source_project=self.project,
            actor=self.lead,
            name="Cloned Project Test by Lead",
            client_name="Cloned Client Test",
        )
        self.assertEqual(cloned_project.created_by, self.lead)

    def test_clone_project_missing_source_requirement(self):
        self.initialize_project()

        source_recurring_pi = ProjectIndicator.objects.get(
            project=self.project, indicator=self.recurring_indicator
        )
        source_recurring_pi.recurring_requirement.delete()

        cloned_project = clone_project(
            source_project=self.project,
            actor=self.admin,
            name="Cloned Project Test Missing Req",
            client_name="Cloned Client Test",
        )

        cloned_recurring_pi = ProjectIndicator.objects.get(
            project=cloned_project, indicator=self.recurring_indicator
        )
        cloned_req = cloned_recurring_pi.recurring_requirement

        self.assertEqual(
            cloned_req.frequency, self.recurring_indicator.recurrence_frequency
        )
        self.assertEqual(cloned_req.mode, self.recurring_indicator.recurrence_mode)
        self.assertEqual(
            cloned_req.instructions, self.recurring_indicator.fulfillment_guidance
        )
        self.assertEqual(
            cloned_req.expected_title_template, self.recurring_indicator.code
        )
        self.assertEqual(cloned_req.start_date, cloned_project.start_date)
        self.assertEqual(cloned_req.end_date, cloned_project.target_date)
        self.assertTrue(cloned_req.is_active)
        self.assertEqual(cloned_recurring_pi.last_updated_by, self.admin)
