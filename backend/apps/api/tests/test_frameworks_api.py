from apps.api.tests.base import ContractBaseTestCase


class FrameworksApiTest(ContractBaseTestCase):
    def test_framework_list_returns_framework_rows(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/frameworks/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        rows = response.json()["data"]
        self.assertGreaterEqual(len(rows), 1)
        self.assertEqual(rows[0]["id"], self.framework.id)
        self.assertEqual(rows[0]["name"], self.framework.name)
