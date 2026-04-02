from apps.api.tests.base import ContractBaseTestCase
from apps.indicators.models import ProjectIndicator
from apps.recurring.models import RecurringRequirement


class ProjectInitializationTest(ContractBaseTestCase):
    def test_initialize_project_from_framework_creates_project_indicators_and_recurring_requirement(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/projects/{self.project.id}/initialize-from-framework/",
            {"create_initial_instances": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertEqual(ProjectIndicator.objects.filter(project=self.project).count(), 2)
        recurring_pi = ProjectIndicator.objects.get(project=self.project, indicator=self.recurring_indicator)
        self.assertTrue(RecurringRequirement.objects.filter(project_indicator=recurring_pi).exists())
