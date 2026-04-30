from django.core.exceptions import PermissionDenied

from apps.api.tests.base import ContractBaseTestCase
from apps.audit.models import AuditEvent
from apps.projects.models import AccreditationProject
from apps.projects.services import update_project


class ProjectServicesUpdateTestCase(ContractBaseTestCase):
    def test_update_project_as_admin(self):
        # Admin modifies the project name and notes
        new_name = "Updated Project Name"
        new_notes = "Some new notes for the project"

        project = update_project(
            project=self.project,
            actor=self.admin,
            name=new_name,
            notes=new_notes,
        )

        # Refresh project from DB
        project.refresh_from_db()
        self.assertEqual(project.name, new_name)
        self.assertEqual(project.notes, new_notes)

        # Check AuditEvent
        audit_event = AuditEvent.objects.filter(
            event_type="project.updated",
            object_id=str(project.id),
        ).first()

        self.assertIsNotNone(audit_event)
        self.assertEqual(audit_event.actor, self.admin)
        self.assertEqual(audit_event.object_type, "AccreditationProject")

        # Check before/after json
        self.assertIsNotNone(audit_event.before_json)
        self.assertIsNotNone(audit_event.after_json)

        self.assertEqual(audit_event.after_json["name"], new_name)
        self.assertEqual(audit_event.after_json["notes"], new_notes)
        self.assertEqual(audit_event.before_json["name"], "Client Alpha Accreditation")

    def test_update_project_as_lead(self):
        new_client_name = "Beta Client"

        project = update_project(
            project=self.project,
            actor=self.lead,
            client_name=new_client_name,
        )

        project.refresh_from_db()
        self.assertEqual(project.client_name, new_client_name)

        audit_event = AuditEvent.objects.filter(
            event_type="project.updated",
            object_id=str(project.id),
        ).first()
        self.assertIsNotNone(audit_event)
        self.assertEqual(audit_event.actor, self.lead)
        self.assertEqual(audit_event.object_type, "AccreditationProject")

        self.assertIsNotNone(audit_event.before_json)
        self.assertIsNotNone(audit_event.after_json)

        self.assertEqual(audit_event.after_json["client_name"], new_client_name)
        self.assertEqual(audit_event.before_json["client_name"], "Client Alpha")

    def test_update_project_as_owner_denied(self):
        original_name = self.project.name

        with self.assertRaises(PermissionDenied):
            update_project(
                project=self.project, actor=self.owner, name="New unauthorized name"
            )

        self.project.refresh_from_db()
        self.assertEqual(self.project.name, original_name)

        audit_exists = AuditEvent.objects.filter(
            event_type="project.updated",
            object_id=str(self.project.id),
        ).exists()
        self.assertFalse(audit_exists)

    def test_update_project_as_reviewer_denied(self):
        with self.assertRaises(PermissionDenied):
            update_project(
                project=self.project,
                actor=self.reviewer,
                notes="Reviewer attempting to update",
            )

    def test_update_project_as_approver_denied(self):
        with self.assertRaises(PermissionDenied):
            update_project(
                project=self.project,
                actor=self.approver,
                notes="Approver attempting to update",
            )
