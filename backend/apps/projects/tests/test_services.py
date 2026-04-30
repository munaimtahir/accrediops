from django.core.exceptions import PermissionDenied

from apps.api.tests.base import ContractBaseTestCase
from apps.audit.models.audit_event import AuditEvent
from apps.projects.models import AccreditationProject
from apps.projects.services import delete_project


class DeleteProjectServiceTests(ContractBaseTestCase):
    def test_delete_project_success_admin(self):
        project_id = self.project.id
        delete_project(project=self.project, actor=self.admin)

        # Verify project is deleted
        with self.assertRaises(AccreditationProject.DoesNotExist):
            AccreditationProject.objects.get(id=project_id)

        # Verify audit event
        audit_event = AuditEvent.objects.filter(
            event_type="project.deleted", object_id=str(project_id)
        ).first()
        self.assertIsNotNone(audit_event)
        self.assertEqual(audit_event.actor, self.admin)
        self.assertIsNotNone(audit_event.before_json)
        self.assertIsNone(audit_event.after_json)

    def test_delete_project_success_lead(self):
        project_id = self.project.id
        delete_project(project=self.project, actor=self.lead)

        # Verify project is deleted
        with self.assertRaises(AccreditationProject.DoesNotExist):
            AccreditationProject.objects.get(id=project_id)

        # Verify audit event
        audit_event = AuditEvent.objects.filter(
            event_type="project.deleted", object_id=str(project_id)
        ).first()
        self.assertIsNotNone(audit_event)
        self.assertEqual(audit_event.actor, self.lead)

    def test_delete_project_permission_denied(self):
        project_id = self.project.id

        # OWNER, REVIEWER, APPROVER should not have access
        for user in [self.owner, self.reviewer, self.approver]:
            with self.assertRaises(PermissionDenied):
                delete_project(project=self.project, actor=user)

            # Verify project is not deleted
            self.assertTrue(AccreditationProject.objects.filter(id=project_id).exists())

            # Verify no audit event is logged
            self.assertFalse(
                AuditEvent.objects.filter(
                    event_type="project.deleted", actor=user, object_id=str(project_id)
                ).exists()
            )
