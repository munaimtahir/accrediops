from apps.api.tests.base import ContractBaseTestCase
from apps.indicators.models import ProjectIndicator
from apps.indicators.services import assign_project_indicator


class AdminReadinessInspectionExportsTest(ContractBaseTestCase):
    def _assign_all(self):
        project_indicators = self.initialize_project()
        for item in project_indicators.values():
            assign_project_indicator(
                project_indicator=item,
                actor=self.admin,
                owner=self.owner,
                reviewer=self.reviewer,
                approver=self.approver,
            )
        return project_indicators

    def _mark_primary_met(self, project_indicator: ProjectIndicator):
        self.client.force_authenticate(user=self.owner)
        create_response = self.client.post(
            "/api/evidence/",
            {
                "project_indicator_id": project_indicator.id,
                "title": "Medication Policy",
                "description": "Policy document",
                "source_type": "URL",
                "file_or_url": "https://files.example/policy.pdf",
                "physical_location_type": "BINDER",
                "location_details": "Binder A / Shelf 2",
                "file_label": "POL-001",
                "is_physical_copy_available": True,
            },
            format="json",
        )
        evidence_id = create_response.json()["data"]["id"]
        self.client.force_authenticate(user=self.reviewer)
        self.client.post(
            f"/api/evidence/{evidence_id}/review/",
            {
                "validity_status": "VALID",
                "completeness_status": "COMPLETE",
                "approval_status": "APPROVED",
                "review_notes": "Approved",
            },
            format="json",
        )
        self.client.force_authenticate(user=self.owner)
        self.client.post(
            f"/api/project-indicators/{project_indicator.id}/start/",
            {"reason": "Start work"},
            format="json",
        )
        self.client.post(
            f"/api/project-indicators/{project_indicator.id}/send-for-review/",
            {"reason": "Ready"},
            format="json",
        )
        self.client.force_authenticate(user=self.approver)
        self.client.post(
            f"/api/project-indicators/{project_indicator.id}/mark-met/",
            {"reason": "Ready for MET"},
            format="json",
        )

    def test_admin_endpoints_require_admin_or_lead(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get("/api/admin/dashboard/")
        self.assertEqual(response.status_code, 403)

    def test_readiness_endpoint_returns_scores_and_risk_rows(self):
        project_indicators = self._assign_all()
        self._mark_primary_met(project_indicators["IND-001"])
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/projects/{self.project.id}/readiness/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()["data"]
        self.assertIn("overall_score", payload)
        self.assertIn("percent_met", payload)
        self.assertIn("recurring_compliance_score", payload)
        self.assertIn("high_risk_indicators", payload)
        self.assertGreaterEqual(len(payload["high_risk_indicators"]), 1)

    def test_inspection_view_returns_only_met_indicators(self):
        project_indicators = self._assign_all()
        self._mark_primary_met(project_indicators["IND-001"])
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/projects/{self.project.id}/inspection-view/")
        self.assertEqual(response.status_code, 200)
        sections = response.json()["data"]["sections"]
        flattened = [
            indicator["indicator_code"]
            for section in sections
            for standard in section["standards"]
            for indicator in standard["indicators"]
        ]
        self.assertIn("IND-001", flattened)
        self.assertNotIn("IND-002", flattened)

    def test_pre_inspection_check_reports_blockers(self):
        self._assign_all()
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/projects/{self.project.id}/pre-inspection-check/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()["data"]
        self.assertIn("missing_evidence", payload)
        self.assertIn("unapproved_items", payload)
        self.assertIn("overdue_recurring", payload)
        self.assertIn("high_risk_indicators", payload)
        self.assertGreaterEqual(len(payload["missing_evidence"]), 1)

    def test_export_generate_and_history(self):
        self._assign_all()
        self.client.force_authenticate(user=self.admin)
        create_response = self.client.post(
            f"/api/exports/projects/{self.project.id}/generate/",
            {"type": "print-bundle", "parameters": {"include_notes": True}},
            format="json",
        )
        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.json()["data"]["type"], "print-bundle")
        history_response = self.client.get(f"/api/exports/projects/{self.project.id}/history/")
        self.assertEqual(history_response.status_code, 200)
        self.assertGreaterEqual(len(history_response.json()["data"]), 1)

    def test_audit_filters_by_user_and_event_type(self):
        project_indicators = self._assign_all()
        target = project_indicators["IND-001"]
        self.client.force_authenticate(user=self.owner)
        self.client.post(
            f"/api/project-indicators/{target.id}/start/",
            {"reason": "Owner-started"},
            format="json",
        )
        self.client.force_authenticate(user=self.admin)
        filtered_user = self.client.get(f"/api/audit/?user={self.owner.id}")
        self.assertEqual(filtered_user.status_code, 200)
        for row in filtered_user.json()["data"]:
            self.assertEqual(row["actor"], self.owner.id)
        filtered_event = self.client.get("/api/audit/?event_type=project_indicator.status_changed")
        self.assertEqual(filtered_event.status_code, 200)
        self.assertTrue(all(row["event_type"] == "project_indicator.status_changed" for row in filtered_event.json()["data"]))

    def test_framework_analysis_endpoint(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/frameworks/{self.framework.id}/analysis/")
        self.assertEqual(response.status_code, 200)
        payload = response.json()["data"]
        self.assertEqual(payload["total_indicators"], 2)
        self.assertEqual(payload["recurring_indicators"], 1)

    def test_framework_import_validation_and_logs(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            "/api/admin/import/validate-framework/",
            {
                "file_name": "test-import.json",
                "rows": [
                    {
                        "area_code": "A1",
                        "standard_code": "S1",
                        "indicator_code": "IND-001",
                        "indicator_text": "A",
                    },
                    {
                        "area_code": "A1",
                        "standard_code": "S1",
                        "indicator_code": "IND-001",
                        "indicator_text": "A duplicate",
                    },
                    {
                        "area_code": "A2",
                        "standard_code": "",
                        "indicator_code": "IND-003",
                        "indicator_text": "Missing standard",
                    },
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["data"]["rows_processed"], 3)
        self.assertGreaterEqual(len(response.json()["data"]["errors"]), 2)
        logs_response = self.client.get("/api/admin/import/logs/")
        self.assertEqual(logs_response.status_code, 200)
        self.assertGreaterEqual(len(logs_response.json()["data"]), 1)

    def test_worklist_row_contains_risk_payload(self):
        project_indicators = self._assign_all()
        self._mark_primary_met(project_indicators["IND-001"])
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/dashboard/worklist/?project_id={self.project.id}")
        self.assertEqual(response.status_code, 200)
        rows = response.json()["data"]["results"]
        self.assertGreaterEqual(len(rows), 2)
        self.assertTrue(all("risk" in row for row in rows))
        self.assertTrue(all("risk_level" in row["risk"] for row in rows))
