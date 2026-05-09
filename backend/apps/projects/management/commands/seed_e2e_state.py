from __future__ import annotations

from datetime import timedelta
import time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.utils import OperationalError
from django.db.models import Q
from django.utils import timezone

from apps.accounts.models import ClientProfile, Department
from apps.frameworks.models import Framework
from apps.masters.choices import RoleChoices
from apps.projects.models import AccreditationProject
from apps.projects.services import initialize_project_from_framework


User = get_user_model()
TARGET_FRAMEWORK_NAME = "PHC LAB"


class Command(BaseCommand):
    help = "Ensure deterministic E2E users and baseline records for Playwright."

    def add_arguments(self, parser):
        parser.add_argument("--password", default="x", help="Password for deterministic E2E users.")
        parser.add_argument(
            "--ensure-client",
            action="store_true",
            help="Ensure deterministic E2E Lab Client exists.",
        )
        parser.add_argument(
            "--ensure-project",
            action="store_true",
            help=f"Ensure deterministic E2E Lab Project exists and points to {TARGET_FRAMEWORK_NAME} framework.",
        )
        parser.add_argument(
            "--clean-e2e-records",
            action="store_true",
            help="Delete stale E2E/PW-prefixed clients and projects before ensuring baseline records.",
        )
        parser.add_argument(
            "--initialize-project",
            action="store_true",
            help=f"When ensuring project, initialize indicators/recurring from {TARGET_FRAMEWORK_NAME} framework idempotently.",
        )

    def handle(self, *args, **options):
        # SQLite can transiently lock when the dev server is handling requests (common in Docker-local).
        # Retrying keeps Playwright seed/setup deterministic without requiring destructive resets.
        for attempt in range(1, 6):
            try:
                return self._handle_atomic(*args, **options)
            except OperationalError as exc:
                message = str(exc).lower()
                if "database is locked" not in message:
                    raise
                if attempt == 5:
                    raise
                time.sleep(0.5 * attempt)

    @transaction.atomic
    def _handle_atomic(self, *args, **options):
        password: str = options["password"]
        ensure_client: bool = options["ensure_client"]
        ensure_project: bool = options["ensure_project"]
        clean_e2e_records: bool = options["clean_e2e_records"]
        initialize_project: bool = options["initialize_project"]

        department, _ = Department.objects.get_or_create(name="LAB E2E")

        self._ensure_user("pw_admin", RoleChoices.ADMIN, password, department, is_staff=True, is_superuser=True)
        self._ensure_user("pw_lead", RoleChoices.LEAD, password, department)
        self._ensure_user("pw_owner", RoleChoices.OWNER, password, department)
        self._ensure_user("pw_reviewer", RoleChoices.REVIEWER, password, department)
        self._ensure_user("pw_approver", RoleChoices.APPROVER, password, department)

        keep_usernames = {"admin", "pw_admin", "pw_lead", "pw_owner", "pw_reviewer", "pw_approver"}
        User.objects.exclude(username__in=keep_usernames).delete()
        Department.objects.exclude(id__in=User.objects.exclude(department_id=None).values_list("department_id", flat=True)).delete()

        if clean_e2e_records:
            self._clean_e2e_business_records()
            self._clean_non_e2e_project_records()
            # Intentionally do NOT delete frameworks/indicators. Verification and E2E should
            # target the existing PHC LAB framework and must not remove other framework data.

        if ensure_client or ensure_project:
            client, _ = ClientProfile.objects.get_or_create(
                organization_name="E2E Lab Client",
                defaults={
                    "address": "E2E Lab Address",
                    "license_number": "E2E-LAB-LIC",
                    "registration_number": "E2E-LAB-REG",
                    "contact_person": "E2E Operator",
                    "department_names": ["Quality", "Compliance"],
                },
            )
        else:
            client = None

        if ensure_project:
            framework = Framework.objects.filter(name=TARGET_FRAMEWORK_NAME).first()
            if framework is None:
                raise CommandError(f"{TARGET_FRAMEWORK_NAME} framework does not exist.")
            today = timezone.localdate()
            admin = User.objects.get(username="pw_admin")
            project, _ = AccreditationProject.objects.update_or_create(
                name="E2E Lab Project",
                defaults={
                    "client_name": "E2E Lab Client",
                    "accrediting_body_name": "LAB Accreditation Board",
                    "framework": framework,
                    "status": "DRAFT",
                    "start_date": today - timedelta(days=1),
                    "target_date": today + timedelta(days=30),
                    "notes": "Deterministic E2E baseline project",
                    "client_profile": client,
                    "created_by": admin,
                },
            )
            if initialize_project:
                initialize_project_from_framework(project=project, actor=admin, create_initial_instances=True)
                
                # Assign default E2E users to all indicators so they have access in tests
                from apps.indicators.models import ProjectIndicator
                from apps.masters.models import MasterValue
                owner = User.objects.get(username="pw_owner")
                reviewer = User.objects.get(username="pw_reviewer")
                approver = User.objects.get(username="pw_approver")
                
                ProjectIndicator.objects.filter(project=project).update(
                    owner=owner,
                    reviewer=reviewer,
                    approver=approver
                )

                # Create one deterministic "MET" indicator with approved evidence, so governance override
                # and role enforcement E2E tests can target a stable completed record.
                from apps.evidence.models import EvidenceItem
                from apps.masters.choices import EvidenceSourceTypeChoices, EvidenceApprovalStatusChoices, EvidenceValidityStatusChoices, EvidenceCompletenessStatusChoices
                from apps.indicators.services import start_project_indicator, send_project_indicator_for_review, mark_project_indicator_met, validate_project_indicator_readiness

                met_targets = list(
                    ProjectIndicator.objects.filter(
                        project=project,
                        indicator__is_recurring=False,
                        indicator__minimum_required_evidence_count__lte=1,
                    )
                    .order_by("id")
                    .values_list("id", flat=True)[:10]
                )
                for target_id in met_targets:
                    met_target = ProjectIndicator.objects.get(id=target_id)
                    if met_target.current_status == "MET":
                        continue
                    EvidenceItem.objects.filter(project_indicator=met_target).delete()
                    EvidenceItem.objects.create(
                        project_indicator=met_target,
                        title="E2E Seed Evidence (Approved)",
                        description="Deterministic approved evidence for E2E readiness.",
                        source_type=EvidenceSourceTypeChoices.TEXT_NOTE,
                        text_content="Seeded evidence text for readiness.",
                        uploaded_by=owner,
                        approval_status=EvidenceApprovalStatusChoices.APPROVED,
                        validity_status=EvidenceValidityStatusChoices.VALID,
                        completeness_status=EvidenceCompletenessStatusChoices.COMPLETE,
                    )
                    start_project_indicator(project_indicator=met_target, actor=owner, reason="E2E seed start")
                    send_project_indicator_for_review(project_indicator=met_target, actor=owner, reason="E2E seed review")
                    readiness = validate_project_indicator_readiness(met_target)
                    if readiness.get("ready_for_met"):
                        mark_project_indicator_met(project_indicator=met_target, actor=approver, reason="E2E seed met")

                # Ensure some master values exist for testing
                MasterValue.objects.get_or_create(key="statuses", code="NOT_STARTED", defaults={"label": "Not Started", "sort_order": 1})
                MasterValue.objects.get_or_create(key="statuses", code="IN_PROGRESS", defaults={"label": "In Progress", "sort_order": 2})
                MasterValue.objects.get_or_create(key="priorities", code="HIGH", defaults={"label": "High", "sort_order": 1})
                MasterValue.objects.get_or_create(key="evidence-types", code="DOCUMENT", defaults={"label": "Document", "sort_order": 1})
                MasterValue.objects.get_or_create(key="document-types", code="POLICY", defaults={"label": "Policy", "sort_order": 1})

        self.stdout.write(self.style.SUCCESS("E2E deterministic seed state ensured."))

    def _ensure_user(
        self,
        username: str,
        role: str,
        password: str,
        department: Department,
        *,
        is_staff: bool = False,
        is_superuser: bool = False,
    ) -> None:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "role": role,
                "department": department,
                "is_staff": is_staff,
                "is_superuser": is_superuser,
                "is_active": True,
            },
        )
        changed = created
        if user.role != role:
            user.role = role
            changed = True
        if user.department_id != department.id:
            user.department = department
            changed = True
        if user.is_staff != is_staff:
            user.is_staff = is_staff
            changed = True
        if user.is_superuser != is_superuser:
            user.is_superuser = is_superuser
            changed = True
        if not user.is_active:
            user.is_active = True
            changed = True
        user.set_password(password)
        if changed:
            user.save()
        else:
            user.save(update_fields=["password"])

    def _clean_e2e_business_records(self) -> None:
        from apps.ai_actions.models import GeneratedOutput
        from apps.evidence.models import EvidenceItem
        from apps.exports.models import ExportJob, PrintPackItem
        from apps.indicators.models import ProjectIndicator, ProjectIndicatorComment, ProjectIndicatorStatusHistory
        from apps.recurring.models import RecurringEvidenceInstance, RecurringRequirement

        e2e_projects = AccreditationProject.objects.filter(
            Q(name__istartswith="E2E_")
            | Q(name__istartswith="E2E ")
            | Q(name__istartswith="PW_")
            | Q(name__istartswith="PW ")
            | Q(name__in=["E2E Lab Project", "E2E Lab Project Clone"])
        )
        e2e_project_ids = list(e2e_projects.values_list("id", flat=True))
        if e2e_project_ids:
            project_indicators = ProjectIndicator.objects.filter(project_id__in=e2e_project_ids)
            project_indicator_ids = list(project_indicators.values_list("id", flat=True))
            if project_indicator_ids:
                RecurringEvidenceInstance.objects.filter(
                    recurring_requirement__project_indicator_id__in=project_indicator_ids
                ).delete()
                RecurringRequirement.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
                GeneratedOutput.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
                EvidenceItem.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
                ProjectIndicatorComment.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
                ProjectIndicatorStatusHistory.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
            project_indicators.delete()
            ExportJob.objects.filter(project_id__in=e2e_project_ids).delete()
            PrintPackItem.objects.filter(project_indicator__project_id__in=e2e_project_ids).delete()
        e2e_projects.delete()

        e2e_clients = ClientProfile.objects.filter(
            Q(organization_name__istartswith="E2E_")
            | Q(organization_name__istartswith="E2E ")
            | Q(organization_name__istartswith="PW_")
            | Q(organization_name__istartswith="PW ")
            | Q(organization_name="E2E Lab Client")
        )
        e2e_clients.delete()

    def _clean_non_e2e_project_records(self) -> None:
        from apps.ai_actions.models import GeneratedOutput
        from apps.evidence.models import EvidenceItem
        from apps.exports.models import ExportJob, PrintPackItem
        from apps.indicators.models import ProjectIndicator, ProjectIndicatorComment, ProjectIndicatorStatusHistory
        from apps.recurring.models import RecurringEvidenceInstance, RecurringRequirement

        projects = AccreditationProject.objects.exclude(
            Q(name__istartswith="E2E_")
            | Q(name__istartswith="E2E ")
            | Q(name__istartswith="PW_")
            | Q(name__istartswith="PW ")
        )
        project_ids = list(projects.values_list("id", flat=True))
        if not project_ids:
            return

        project_indicators = ProjectIndicator.objects.filter(project_id__in=project_ids)
        project_indicator_ids = list(project_indicators.values_list("id", flat=True))
        if project_indicator_ids:
            RecurringEvidenceInstance.objects.filter(
                recurring_requirement__project_indicator_id__in=project_indicator_ids
            ).delete()
            RecurringRequirement.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
            GeneratedOutput.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
            EvidenceItem.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
            ProjectIndicatorComment.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
            ProjectIndicatorStatusHistory.objects.filter(project_indicator_id__in=project_indicator_ids).delete()
        project_indicators.delete()
        ExportJob.objects.filter(project_id__in=project_ids).delete()
        PrintPackItem.objects.filter(project_indicator__project_id__in=project_ids).delete()
        projects.delete()
