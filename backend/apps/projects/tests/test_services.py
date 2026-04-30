from datetime import timedelta

from django.core.exceptions import PermissionDenied
from django.utils import timezone

from apps.api.tests.base import ContractBaseTestCase
from apps.audit.models import AuditEvent
from apps.projects.models import AccreditationProject
from apps.projects.services import create_project


class CreateProjectTestCase(ContractBaseTestCase):
    def setUp(self):
        super().setUp()
        self.valid_data = {
            "name": "New Test Project",
            "client_name": "Test Client",
            "accrediting_body_name": "Test Body",
            "framework": self.framework,
            "start_date": timezone.localdate(),
            "target_date": timezone.localdate() + timedelta(days=30),
            "notes": "Test notes",
        }

    def test_create_project_admin(self):
        # Admin can create a project
        project = create_project(actor=self.admin, **self.valid_data)

        # Verify the project was created correctly
        self.assertEqual(project.name, "New Test Project")
        self.assertEqual(project.client_name, "Test Client")
        self.assertEqual(project.framework, self.framework)
        self.assertEqual(project.created_by, self.admin)

        # Verify the project was created in the database
        self.assertTrue(AccreditationProject.objects.filter(id=project.id).exists())

        # Verify audit event was logged
        audit_events = AuditEvent.objects.filter(
            event_type="project.created", object_id=str(project.id)
        )
        self.assertEqual(audit_events.count(), 1)
        event = audit_events.first()
        self.assertEqual(event.actor, self.admin)
        self.assertIsNotNone(event.after_json)
        self.assertEqual(event.after_json.get("name"), "New Test Project")

    def test_create_project_lead(self):
        # Lead can also create a project
        project = create_project(actor=self.lead, **self.valid_data)
        self.assertEqual(project.name, "New Test Project")
        self.assertEqual(project.created_by, self.lead)

    def test_create_project_denied_roles(self):
        # Non-admin/lead roles cannot create a project
        denied_actors = [self.owner, self.reviewer, self.approver]
        for actor in denied_actors:
            with self.subTest(role=actor.role):
                with self.assertRaisesMessage(
                    PermissionDenied, "Only ADMIN or LEAD can perform this action."
                ):
                    create_project(actor=actor, **self.valid_data)
