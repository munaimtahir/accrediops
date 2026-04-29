from django.db import transaction
from django.utils import timezone

from apps.audit.services import log_audit_event, snapshot_instance
from apps.indicators.models import Indicator, ProjectIndicator
from apps.masters.choices import ProjectStatusChoices
from apps.projects.models import AccreditationProject
from apps.recurring.models import RecurringRequirement
from apps.workflow.permissions import ensure_admin_or_lead_access


def create_project(*, actor, **validated_data) -> AccreditationProject:
    ensure_admin_or_lead_access(actor)
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


@transaction.atomic
def delete_project(*, project: AccreditationProject, actor) -> None:
    ensure_admin_or_lead_access(actor)
    before = snapshot_instance(project)
    project_id = project.id
    project.delete()
    log_audit_event(
        actor=actor,
        event_type="project.deleted",
        obj=AccreditationProject(id=project_id),
        before=before,
        after=None,
    )


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


@transaction.atomic
def clone_project(
    *,
    source_project: AccreditationProject,
    actor,
    name: str,
    client_name: str,
) -> AccreditationProject:
    ensure_admin_or_lead_access(actor)
    project = AccreditationProject.objects.create(
        name=name,
        client_name=client_name,
        accrediting_body_name=source_project.accrediting_body_name,
        framework=source_project.framework,
        status=ProjectStatusChoices.DRAFT,
        start_date=source_project.start_date,
        target_date=source_project.target_date,
        notes=source_project.notes,
        created_by=actor,
        client_profile=source_project.client_profile,
    )
    source_items = (
        ProjectIndicator.objects.filter(project=source_project)
        .select_related("indicator", "owner", "reviewer", "approver", "recurring_requirement")
        .all()
    )
    source_by_indicator_id = {item.indicator_id: item for item in source_items}
    indicators = list(
        Indicator.objects.filter(
            framework=source_project.framework,
            is_active=True,
        ).select_related("area", "standard")
    )

    project_indicators_to_create = []
    for indicator in indicators:
        source_item = source_by_indicator_id.get(indicator.id)
        project_indicators_to_create.append(
            ProjectIndicator(
                project=project,
                indicator=indicator,
                owner=source_item.owner if source_item else None,
                reviewer=source_item.reviewer if source_item else None,
                approver=source_item.approver if source_item else None,
                priority=source_item.priority if source_item else "MEDIUM",
                due_date=project.target_date,
                notes="",
                last_updated_by=actor,
            )
        )

    created_project_indicators = ProjectIndicator.objects.bulk_create(project_indicators_to_create)

    recurring_requirements_to_create = []
    # Use zip to avoid project_indicator.indicator lazy-loading queries
    for indicator, project_indicator in zip(indicators, created_project_indicators):
        if indicator.is_recurring:
            source_item = source_by_indicator_id.get(indicator.id)
            # With select_related("recurring_requirement"), this is safe and doesn't trigger queries
            source_requirement = source_item.recurring_requirement if source_item else None

            recurring_requirements_to_create.append(
                RecurringRequirement(
                    project_indicator=project_indicator,
                    frequency=source_requirement.frequency if source_requirement else indicator.recurrence_frequency,
                    mode=source_requirement.mode if source_requirement else indicator.recurrence_mode,
                    start_date=project.start_date,
                    end_date=project.target_date,
                    is_active=True,
                    instructions=(
                        source_requirement.instructions if source_requirement else indicator.fulfillment_guidance
                    ),
                    expected_title_template=(
                        source_requirement.expected_title_template if source_requirement else indicator.code
                    ),
                )
            )

    if recurring_requirements_to_create:
        RecurringRequirement.objects.bulk_create(recurring_requirements_to_create)

    log_audit_event(
        actor=actor,
        event_type="project.cloned",
        obj=project,
        before=None,
        after=snapshot_instance(project),
        reason=f"cloned from project {source_project.id}",
    )
    return project
