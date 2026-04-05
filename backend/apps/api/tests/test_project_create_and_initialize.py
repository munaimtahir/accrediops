from apps.api.tests.base import ContractBaseTestCase
from apps.indicators.models import ProjectIndicator


class ProjectCreateAndInitializeTest(ContractBaseTestCase):
    def test_admin_can_create_and_initialize_project_from_framework(self):
        self.client.force_authenticate(user=self.admin)
        create_response = self.client.post(
            "/api/projects/",
            {
                "name": "New Accreditation Workspace",
                "client_name": "Client Gamma",
                "accrediting_body_name": "National Board",
                "framework": self.framework.id,
                "start_date": str(self.project.start_date),
                "target_date": str(self.project.target_date),
                "notes": "Created from UI flow",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, 201)
        created_project_id = create_response.json()["data"]["id"]
        self.assertEqual(create_response.json()["data"]["status"], "DRAFT")

        init_response = self.client.post(
            f"/api/projects/{created_project_id}/initialize-from-framework/",
            {"create_initial_instances": True},
            format="json",
        )
        self.assertEqual(init_response.status_code, 200)
        self.assertEqual(
            ProjectIndicator.objects.filter(project_id=created_project_id).count(),
            2,
        )

    def test_owner_cannot_create_project(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            "/api/projects/",
            {
                "name": "Unauthorized create",
                "client_name": "Client Blocked",
                "accrediting_body_name": "National Board",
                "framework": self.framework.id,
                "start_date": str(self.project.start_date),
                "target_date": str(self.project.target_date),
            },
            format="json",
        )
        self.assertEqual(response.status_code, 403)
