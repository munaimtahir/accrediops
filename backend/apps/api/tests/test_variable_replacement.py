from apps.accounts.models import ClientProfile
from apps.api.tests.base import ContractBaseTestCase


class VariableReplacementTest(ContractBaseTestCase):
    def test_client_profile_variable_preview_replaces_known_placeholders(self):
        profile = ClientProfile.objects.create(
            organization_name="Acme Health",
            address="Main Street",
            license_number="LIC-123",
            registration_number="REG-987",
            contact_person="A. Manager",
            department_names=["Quality", "Compliance"],
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f"/api/client-profiles/{profile.id}/variables-preview/",
            {"text": "{{organization_name}}/{{license_number}}/{{contact_person}}"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["replaced_text"], "Acme Health/LIC-123/A. Manager")
