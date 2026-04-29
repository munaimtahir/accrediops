from apps.accounts.models import ClientProfile
from apps.api.tests.base import ContractBaseTestCase
from apps.audit.models import AuditEvent
from apps.projects.models import AccreditationProject


class ProjectDeleteAndClientProfilesTest(ContractBaseTestCase):
    def test_admin_can_delete_project(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f"/api/projects/{self.project.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"], {"id": self.project.id, "deleted": True})
        self.assertFalse(AccreditationProject.objects.filter(id=self.project.id).exists())
        self.assertTrue(
            AuditEvent.objects.filter(
                event_type="project.deleted",
                object_type="AccreditationProject",
                object_id=str(self.project.id),
            ).exists()
        )

    def test_owner_cannot_delete_project(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.delete(f"/api/projects/{self.project.id}/")

        self.assertEqual(response.status_code, 403)
        self.assertTrue(AccreditationProject.objects.filter(id=self.project.id).exists())

    def test_client_profile_can_store_linked_users(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            "/api/client-profiles/",
            {
                "organization_name": "Acme Health",
                "contact_person": "A. Manager",
                "linked_user_ids": [self.owner.id, self.reviewer.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        profile = ClientProfile.objects.get(id=response.json()["data"]["id"])
        self.assertCountEqual(profile.linked_users.values_list("id", flat=True), [self.owner.id, self.reviewer.id])
        returned_user_ids = [user["id"] for user in response.json()["data"]["linked_users"]]
        self.assertCountEqual(returned_user_ids, [self.owner.id, self.reviewer.id])
