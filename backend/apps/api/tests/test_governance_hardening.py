from apps.api.tests.base import ContractBaseTestCase
from apps.accounts.models import User
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.exports.models import ExportJob
from apps.indicators.services import assign_project_indicator
from apps.recurring.services import approve_recurring_instance, generate_recurring_instances, submit_recurring_instance


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

    def _make_project_export_ready(self, primary, recurring):
        self._mark_primary_met(primary)

        requirement = recurring.recurring_requirement
        instances = requirement.instances.order_by("due_date")
        for instance in instances:
            submitted = submit_recurring_instance(
                recurring_instance=instance,
                actor=self.owner,
                text_content=f"Recurring evidence for {instance.period_label}",
                notes="Recurring submission for export readiness",
            )
            approve_recurring_instance(
                recurring_instance=submitted,
                actor=self.reviewer,
                approval_status="APPROVED",
                notes="Recurring approval for export readiness",
            )

        self.client.force_authenticate(user=self.owner)
        self.client.post(
            f"/api/project-indicators/{recurring.id}/start/",
            {"reason": "Start recurring export path"},
            format="json",
        )
        self.client.post(
            f"/api/project-indicators/{recurring.id}/send-for-review/",
            {"reason": "Recurring item ready for review"},
            format="json",
        )
        self.client.force_authenticate(user=self.approver)
        response = self.client.post(
            f"/api/project-indicators/{recurring.id}/mark-met/",
            {"reason": "Recurring item satisfied for export"},
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
        primary, recurring = self._assign_indicator_roles()
        missing_role_user = User.objects.create_user(
            username="missing_role_user",
            password="x",
            role="",
            department=self.department,
        )

        self.client.force_authenticate(user=self.owner)
        denied_generate = self.client.post(
            f"/api/exports/projects/{self.project.id}/generate/",
            {"type": "print-bundle", "parameters": {"include_notes": True}},
            format="json",
        )
        self.assertEqual(denied_generate.status_code, 403)
        denied_history = self.client.get(f"/api/exports/projects/{self.project.id}/history/")
        self.assertEqual(denied_history.status_code, 403)
        denied_excel = self.client.get(f"/api/exports/projects/{self.project.id}/excel/")
        self.assertEqual(denied_excel.status_code, 403)
        denied_bundle = self.client.get(f"/api/exports/projects/{self.project.id}/print-bundle/")
        self.assertEqual(denied_bundle.status_code, 403)
        denied_physical = self.client.get(f"/api/exports/projects/{self.project.id}/physical-retrieval/")
        self.assertEqual(denied_physical.status_code, 403)

        self.client.force_authenticate(user=missing_role_user)
        missing_role_generate = self.client.post(
            f"/api/exports/projects/{self.project.id}/generate/",
            {"type": "print-bundle", "parameters": {}},
            format="json",
        )
        self.assertEqual(missing_role_generate.status_code, 403)

        self.client.force_authenticate(user=self.admin)
        blocked_before_ready = self.client.post(
            f"/api/exports/projects/{self.project.id}/generate/",
            {"type": "print-bundle", "parameters": {"include_notes": True}},
            format="json",
        )
        self.assertEqual(blocked_before_ready.status_code, 403)
        self.assertIn("Export blocked:", blocked_before_ready.json()["error"]["message"])

        self._make_project_export_ready(primary, recurring)
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
        self.assertEqual(created_payload["status"], "READY")
        self.assertEqual(created_payload["warnings"], [])
        self.assertTrue(ExportJob.objects.filter(id=created_payload["id"], project=self.project).exists())

        history = self.client.get(f"/api/exports/projects/{self.project.id}/history/")
        self.assertEqual(history.status_code, 200)
        jobs = history.json()["data"]
        self.assertTrue(any(job["id"] == created_payload["id"] for job in jobs))

        excel = self.client.get(f"/api/exports/projects/{self.project.id}/excel/")
        self.assertEqual(excel.status_code, 200)
        bundle = self.client.get(f"/api/exports/projects/{self.project.id}/print-bundle/")
        self.assertEqual(bundle.status_code, 200)
        physical = self.client.get(f"/api/exports/projects/{self.project.id}/physical-retrieval/")
        self.assertEqual(physical.status_code, 200)

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

    def test_indicator_detail_capabilities_reflect_assignment_aware_permissions(self):
        primary, _ = self._assign_indicator_roles()
        other_owner = User.objects.create_user(
            username="other_owner_user",
            password="x",
            role="OWNER",
            department=self.department,
        )
        other_reviewer = User.objects.create_user(
            username="other_reviewer_user",
            password="x",
            role="REVIEWER",
            department=self.department,
        )
        other_approver = User.objects.create_user(
            username="other_approver_user",
            password="x",
            role="APPROVER",
            department=self.department,
        )

        self.client.force_authenticate(user=other_owner)
        other_owner_detail = self.client.get(f"/api/project-indicators/{primary.id}/")
        self.assertEqual(other_owner_detail.status_code, 200)
        self.assertFalse(other_owner_detail.json()["data"]["capabilities"]["can_start"])
        self.assertFalse(other_owner_detail.json()["data"]["capabilities"]["can_send_for_review"])
        self.assertFalse(other_owner_detail.json()["data"]["capabilities"]["can_generate_ai"])

        self.client.force_authenticate(user=self.owner)
        owner_detail = self.client.get(f"/api/project-indicators/{primary.id}/")
        self.assertEqual(owner_detail.status_code, 200)
        self.assertTrue(owner_detail.json()["data"]["capabilities"]["can_start"])
        self.assertTrue(owner_detail.json()["data"]["capabilities"]["can_send_for_review"])
        self.assertTrue(owner_detail.json()["data"]["capabilities"]["can_generate_ai"])
        self.assertFalse(owner_detail.json()["data"]["capabilities"]["can_mark_met"])

        self.client.force_authenticate(user=other_reviewer)
        other_reviewer_detail = self.client.get(f"/api/project-indicators/{primary.id}/")
        self.assertEqual(other_reviewer_detail.status_code, 200)
        self.assertFalse(other_reviewer_detail.json()["data"]["capabilities"]["can_review_evidence"])
        self.assertFalse(other_reviewer_detail.json()["data"]["capabilities"]["can_approve_recurring"])

        self.client.force_authenticate(user=self.reviewer)
        reviewer_detail = self.client.get(f"/api/project-indicators/{primary.id}/")
        self.assertEqual(reviewer_detail.status_code, 200)
        self.assertTrue(reviewer_detail.json()["data"]["capabilities"]["can_review_evidence"])
        self.assertTrue(reviewer_detail.json()["data"]["capabilities"]["can_approve_recurring"])
        self.assertFalse(reviewer_detail.json()["data"]["capabilities"]["can_generate_ai"])

        self.client.force_authenticate(user=other_approver)
        other_approver_detail = self.client.get(f"/api/project-indicators/{primary.id}/")
        self.assertEqual(other_approver_detail.status_code, 200)
        self.assertFalse(other_approver_detail.json()["data"]["capabilities"]["can_mark_met"])

        self.client.force_authenticate(user=self.approver)
        approver_detail = self.client.get(f"/api/project-indicators/{primary.id}/")
        self.assertEqual(approver_detail.status_code, 200)
        self.assertTrue(approver_detail.json()["data"]["capabilities"]["can_mark_met"])
        self.assertTrue(approver_detail.json()["data"]["capabilities"]["can_review_evidence"])
        self.assertFalse(approver_detail.json()["data"]["capabilities"]["can_generate_ai"])

        self.client.force_authenticate(user=self.lead)
        lead_detail = self.client.get(f"/api/project-indicators/{primary.id}/")
        self.assertEqual(lead_detail.status_code, 200)
        self.assertTrue(lead_detail.json()["data"]["capabilities"]["can_assign"])
        self.assertTrue(lead_detail.json()["data"]["capabilities"]["can_generate_ai"])
        self.assertFalse(lead_detail.json()["data"]["capabilities"]["can_reopen"])

        self.client.force_authenticate(user=self.admin)
        admin_detail = self.client.get(f"/api/project-indicators/{primary.id}/")
        self.assertEqual(admin_detail.status_code, 200)
        self.assertTrue(admin_detail.json()["data"]["capabilities"]["can_assign"])
        self.assertTrue(admin_detail.json()["data"]["capabilities"]["can_reopen"])

    def test_admin_and_lead_entry_permissions_reject_unauthorized_roles(self):
        self._assign_indicator_roles()
        missing_role_user = User.objects.create_user(
            username="no_role_entry_user",
            password="x",
            role="",
            department=self.department,
        )
        restricted_requests = [
            ("get", "/api/admin/dashboard/"),
            ("get", "/api/audit/"),
            ("get", "/api/admin/overrides/"),
            ("get", f"/api/projects/{self.project.id}/readiness/"),
            ("get", "/api/admin/import/logs/"),
        ]

        for user in (self.owner, missing_role_user):
            self.client.force_authenticate(user=user)
            for method, path in restricted_requests:
                response = getattr(self.client, method)(path)
                self.assertEqual(response.status_code, 403)
