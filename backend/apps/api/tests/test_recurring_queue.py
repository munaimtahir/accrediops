from django.utils import timezone

from apps.api.tests.base import ContractBaseTestCase
from apps.indicators.services import assign_project_indicator
from apps.recurring.services import generate_recurring_instances


class RecurringQueueTest(ContractBaseTestCase):
    def test_recurring_generation_and_due_overdue_queue(self):
        project_indicators = self.initialize_project()
        recurring_pi = project_indicators["IND-002"]
        assign_project_indicator(
            project_indicator=recurring_pi,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )
        requirement = recurring_pi.recurring_requirement
        generate_recurring_instances(
            recurring_requirement=requirement,
            actor=self.admin,
            until_date=timezone.localdate(),
        )
        self.assertGreaterEqual(requirement.instances.count(), 2)

        self.client.force_authenticate(user=self.admin)
        due_today_response = self.client.get(
            f"/api/recurring/queue/?project_id={self.project.id}&due_today=true"
        )
        self.assertEqual(due_today_response.status_code, 200)
        self.assertTrue(any(item["due_date"] == str(timezone.localdate()) for item in due_today_response.json()["data"]))

        overdue_response = self.client.get(
            f"/api/recurring/queue/?project_id={self.project.id}&overdue=true"
        )
        self.assertEqual(overdue_response.status_code, 200)
        self.assertTrue(any(item["due_date"] < str(timezone.localdate()) for item in overdue_response.json()["data"]))

    def test_recurring_submit_and_approve_flow_updates_instance_status(self):
        project_indicators = self.initialize_project()
        recurring_pi = project_indicators["IND-002"]
        assign_project_indicator(
            project_indicator=recurring_pi,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )
        requirement = recurring_pi.recurring_requirement
        generate_recurring_instances(
            recurring_requirement=requirement,
            actor=self.admin,
            until_date=timezone.localdate(),
        )
        instance = requirement.instances.get(due_date=timezone.localdate())

        self.client.force_authenticate(user=self.owner)
        submit_response = self.client.post(
            f"/api/recurring/instances/{instance.id}/submit/",
            {"text_content": "Daily check completed.", "notes": "Submitted from test."},
            format="json",
        )
        self.assertEqual(submit_response.status_code, 200)
        self.assertEqual(submit_response.json()["data"]["status"], "SUBMITTED")

        self.client.force_authenticate(user=self.reviewer)
        approve_response = self.client.post(
            f"/api/recurring/instances/{instance.id}/approve/",
            {"approval_status": "APPROVED", "notes": "Looks good."},
            format="json",
        )
        self.assertEqual(approve_response.status_code, 200)
        self.assertEqual(approve_response.json()["data"]["status"], "APPROVED")
