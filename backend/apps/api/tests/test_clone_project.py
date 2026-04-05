from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.services import create_evidence_item
from apps.indicators.models import ProjectIndicator
from apps.indicators.services import assign_project_indicator


class CloneProjectTest(ContractBaseTestCase):
    def test_clone_project_creates_fresh_project_indicators_without_evidence(self):
        self.initialize_project()
        source_pi = ProjectIndicator.objects.get(project=self.project, indicator=self.indicator)
        assign_project_indicator(
            project_indicator=source_pi,
            actor=self.admin,
            owner=self.owner,
            reviewer=self.reviewer,
            approver=self.approver,
        )
        create_evidence_item(
            project_indicator=source_pi,
            actor=self.owner,
            title="Source only evidence",
            source_type="URL",
            file_or_url="https://files.example/source-only.pdf",
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/projects/{self.project.id}/clone/",
            {"name": "Client Beta Accreditation", "client_name": "Client Beta"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        clone_project_id = response.json()["data"]["id"]
        cloned_items = ProjectIndicator.objects.filter(project_id=clone_project_id)
        self.assertEqual(cloned_items.count(), 2)
        self.assertFalse(cloned_items.filter(evidence_items__isnull=False).exists())
