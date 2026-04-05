from apps.api.tests.base import ContractBaseTestCase


class AuthApiTest(ContractBaseTestCase):
    def test_session_endpoint_returns_unauthenticated_and_sets_cookie(self):
        response = self.client.get("/api/auth/session/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertFalse(response.json()["data"]["authenticated"])
        self.assertIsNone(response.json()["data"]["user"])
        self.assertIn("csrftoken", response.cookies)

    def test_login_and_logout_cycle_updates_session_state(self):
        session_response = self.client.get("/api/auth/session/")
        csrf_token = session_response.cookies["csrftoken"].value

        login_response = self.client.post(
            "/api/auth/login/",
            {"username": self.owner.username, "password": "x"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertTrue(login_response.json()["data"]["authenticated"])
        self.assertEqual(login_response.json()["data"]["user"]["username"], self.owner.username)

        me_response = self.client.get("/api/auth/session/")
        self.assertEqual(me_response.status_code, 200)
        self.assertTrue(me_response.json()["data"]["authenticated"])
        self.assertEqual(me_response.json()["data"]["user"]["username"], self.owner.username)

        logout_response = self.client.post(
            "/api/auth/logout/",
            {},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(logout_response.status_code, 200)
        self.assertFalse(logout_response.json()["data"]["authenticated"])
        self.assertIsNone(logout_response.json()["data"]["user"])

    def test_login_rejects_invalid_credentials(self):
        session_response = self.client.get("/api/auth/session/")
        csrf_token = session_response.cookies["csrftoken"].value

        response = self.client.post(
            "/api/auth/login/",
            {"username": self.owner.username, "password": "wrong"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()["success"])
