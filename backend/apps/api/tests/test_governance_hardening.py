from apps.api.tests.base import ContractBaseTestCase
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.exports.models import ExportJob
from apps.indicators.services import assign_project_indicator
from apps.recurring.services import generate_recurring_instances


class GovernanceHardeningTest(ContractBaseTestCase):
    def _assign_indicator_roles(self):
        project_indicators = self.initialize_project()
        primary = project_indicators["IND-001"]
        recurring = project_indicators["IND-002"]
        for item in (primary, recurring):
            assign_project_indicator(
                project_indicator=item,
                actor=self.admin,
                owner=self.owner,
                reviewer=self.reviewer,
                approver=self.approver,
            )
        return primary, recurring

    def _mark_primary_met(self, primary):
        evidence = create_evidence_item(
            project_indicator=primary,
            actor=self.owner,
            title="Governance policy",
            description="Policy for governance flow",
            source_type="URL",
            file_or_url="https://files.example/governance.pdf",
        )
        review_evidence_item(
            evidence_item=evidence,
            actor=self.reviewer,
            validity_status="VALID",
            completeness_status="COMPLETE",
            approval_status="APPROVED",
            review_notes="Approved for governance test",
        )
        self.client.force_authenticate(user=self.owner)
        self.client.post(
            f"/api/project-indicators/{primary.id}/start/",
            {"reason": "Start governance path"},
            format="json",
        )
        self.client.post(
            f"/api/project-indicators/{primary.id}/send-for-review/",
            {"reason": "Ready for governance review"},
            format="json",
        )
        self.client.force_authenticate(user=self.approver)
        response = self.client.post(
            f"/api/project-indicators/{primary.id}/mark-met/",
            {"reason": "Governance-ready met"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

    def test_override_reopen_requires_admin_and_is_audited(self):
        primary, _ = self._assign_indicator_roles()
        self._mark_primary_met(primary)

        self.client.force_authenticate(user=self.lead)
        lead_reopen = self.client.post(
            f"/api/project-indicators/{primary.id}/reopen/",
            {"reason": "Lead should be denied"},
            format="json",
        )
        self.assertEqual(lead_reopen.status_code, 403)

        self.client.force_authenticate(user=self.admin)
        admin_reopen = self.client.post(
            f"/api/project-indicators/{primary.id}/reopen/",
            {"reason": "Admin governance override"},
            format="json",
        )
        self.assertEqual(admin_reopen.status_code, 200)
        self.assertEqual(admin_reopen.json()["data"]["current_status"], "IN_PROGRESS")

        overrides = self.client.get("/api/admin/overrides/")
        self.assertEqual(overrides.status_code, 200)
        rows = overrides.json()["data"]
        self.assertTrue(any(row["reason"] == "Admin governance override" for row in rows))

        audit = self.client.get(
            "/api/audit/?event_type=project_indicator.status_changed&object_type=ProjectIndicator"
        )
        self.assertEqual(audit.status_code, 200)
        self.assertTrue(any(row["reason"] == "Admin governance override" for row in audit.json()["data"]))

    def test_export_lifecycle_history_and_permissions(self):
        self._assign_indicator_roles()

        self.client.force_authenticate(user=self.owner)
        denied_generate = self.client.post(
            f"/api/exports/projects/{self.project.id}/generate/",
            {"type": "print-bundle", "parameters": {"include_notes": True}},
            format="json",
        )
        self.assertEqual(denied_generate.status_code, 403)
        denied_history = self.client.get(f"/api/exports/projects/{self.project.id}/history/")
        self.assertEqual(denied_history.status_code, 403)

        self.client.force_authenticate(user=self.admin)
        created = self.client.post(
            f"/api/exports/projects/{self.project.id}/generate/",
            {"type": "print-bundle", "parameters": {"include_notes": True}},
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        created_payload = created.json()["data"]
        self.assertEqual(created_payload["type"], "print-bundle")
        self.assertIn(created_payload["status"], {"READY", "WARNING"})
        self.assertIsInstance(created_payload["warnings"], list)
        self.assertTrue(ExportJob.objects.filter(id=created_payload["id"], project=self.project).exists())

        history = self.client.get(f"/api/exports/projects/{self.project.id}/history/")
        self.assertEqual(history.status_code, 200)
        jobs = history.json()["data"]
        self.assertTrue(any(job["id"] == created_payload["id"] for job in jobs))

    def test_permission_matrix_for_sensitive_actions(self):
        primary, recurring = self._assign_indicator_roles()
        requirement = recurring.recurring_requirement
        generate_recurring_instances(
            recurring_requirement=requirement,
            actor=self.admin,
            until_date=primary.project.target_date,
        )
        instance = requirement.instances.first()
        self.assertIsNotNone(instance)

        self.client.force_authenticate(user=self.owner)
        owner_approve = self.client.post(
            f"/api/recurring/instances/{instance.id}/approve/",
            {"approval_status": "APPROVED", "notes": "Owner cannot approve"},
            format="json",
        )
        self.assertEqual(owner_approve.status_code, 403)

        self.client.force_authenticate(user=self.reviewer)
        reviewer_submit = self.client.post(
            f"/api/recurring/instances/{instance.id}/submit/",
            {"text_content": "Reviewer cannot submit owner task"},
            format="json",
        )
        self.assertEqual(reviewer_submit.status_code, 403)

        self.client.force_authenticate(user=self.reviewer)
        evidence = create_evidence_item(
            project_indicator=primary,
            actor=self.owner,
            title="Role matrix evidence",
            source_type="URL",
            file_or_url="https://files.example/role-matrix.pdf",
        )
        reviewer_review = self.client.post(
            f"/api/evidence/{evidence.id}/review/",
            {
                "validity_status": "VALID",
                "completeness_status": "COMPLETE",
                "approval_status": "APPROVED",
            },
            format="json",
        )
        self.assertEqual(reviewer_review.status_code, 200)

        self.client.force_authenticate(user=self.owner)
        owner_review = self.client.post(
            f"/api/evidence/{evidence.id}/review/",
            {
                "validity_status": "VALID",
                "completeness_status": "COMPLETE",
                "approval_status": "APPROVED",
            },
            format="json",
        )
        self.assertEqual(owner_review.status_code, 403)

