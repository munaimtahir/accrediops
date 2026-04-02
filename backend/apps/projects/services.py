from django.db import transaction
from django.utils import timezone

from apps.audit.services import log_audit_event, snapshot_instance
from apps.indicators.models import Indicator, ProjectIndicator
from apps.masters.choices import ProjectStatusChoices
from apps.projects.models import AccreditationProject
from apps.workflow.permissions import ensure_admin_or_lead_access


def create_project(*, actor, **validated_data) -> AccreditationProject:
    project = AccreditationProject.objects.create(created_by=actor, **validated_data)
    log_audit_event(
        actor=actor,
        event_type="project.created",
        obj=project,
        before=None,
        after=snapshot_instance(project),
    )
    return project


@transaction.atomic
def update_project(*, project: AccreditationProject, actor, **validated_data) -> AccreditationProject:
    ensure_admin_or_lead_access(actor)
    before = snapshot_instance(project)
    for field, value in validated_data.items():
        setattr(project, field, value)
    project.save()
    log_audit_event(
        actor=actor,
        event_type="project.updated",
        obj=project,
        before=before,
        after=snapshot_instance(project),
    )
    return project


def project_summary_counts(project: AccreditationProject) -> dict:
    from apps.recurring.models import RecurringEvidenceInstance

    today = timezone.localdate()
    project_indicators = ProjectIndicator.objects.filter(project=project)
    recurring_instances = RecurringEvidenceInstance.objects.filter(
        recurring_requirement__project_indicator__project=project,
    )
    return {
        "total_indicators": project_indicators.count(),
        "met_indicators": project_indicators.filter(is_met=True).count(),
        "pending_indicators": project_indicators.exclude(is_met=True).count(),
        "recurring_due_today": recurring_instances.filter(
            due_date=today,
            status__in=["PENDING", "SUBMITTED", "MISSED"],
        ).count(),
        "overdue_recurring_items": recurring_instances.filter(
            due_date__lt=today,
            status__in=["PENDING", "SUBMITTED", "MISSED"],
        ).count(),
    }


@transaction.atomic
def initialize_project_from_framework(
    *,
    project: AccreditationProject,
    actor,
    create_initial_instances: bool = True,
) -> dict:
    from apps.recurring.services import ensure_recurring_requirement_for_project_indicator, generate_recurring_instances

    ensure_admin_or_lead_access(actor)
    indicators = Indicator.objects.filter(
        framework=project.framework,
        is_active=True,
    ).select_related("area", "standard")
    created_count = 0
    recurring_count = 0
    until_date = min(project.target_date, timezone.localdate())

    for indicator in indicators:
        project_indicator, created = ProjectIndicator.objects.get_or_create(
            project=project,
            indicator=indicator,
            defaults={
                "priority": "MEDIUM",
                "due_date": project.target_date,
                "last_updated_by": actor,
            },
        )
        if created:
            created_count += 1
        if indicator.is_recurring:
            recurring_requirement = ensure_recurring_requirement_for_project_indicator(
                project_indicator=project_indicator,
                actor=actor,
            )
            recurring_count += 1
            if create_initial_instances:
                generate_recurring_instances(
                    recurring_requirement=recurring_requirement,
                    actor=actor,
                    until_date=until_date,
                )

    if project.status == ProjectStatusChoices.DRAFT:
        project.status = ProjectStatusChoices.ACTIVE
        project.save(update_fields=["status", "updated_at"])

    log_audit_event(
        actor=actor,
        event_type="project.initialized_from_framework",
        obj=project,
        before=None,
        after={
            "created_project_indicators": created_count,
            "recurring_requirements_processed": recurring_count,
        },
    )
    return {
        "created_project_indicators": created_count,
        "recurring_requirements_processed": recurring_count,
    }
