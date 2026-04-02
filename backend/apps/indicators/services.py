from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone

from apps.audit.models import AuditEvent
from apps.audit.services import log_audit_event, snapshot_instance
from apps.indicators.models import (
    ProjectIndicator,
    ProjectIndicatorComment,
    ProjectIndicatorStatusHistory,
)
from apps.masters.choices import (
    IndicatorCommentTypeChoices,
    PriorityChoices,
    ProjectIndicatorStatusChoices,
    RoleChoices,
)
from apps.workflow.guards import allow_workflow_transition
from apps.workflow.permissions import (
    ensure_admin_access,
    ensure_admin_or_lead_access,
    ensure_comment_permission,
    ensure_project_approver_access,
    ensure_project_owner_access,
)
from apps.workflow.transitions import validate_transition


def _validate_assignment_roles(*, owner=None, reviewer=None, approver=None) -> None:
    if owner and owner.role != RoleChoices.OWNER:
        raise ValidationError("Assigned owner must have OWNER role.")
    if reviewer and reviewer.role != RoleChoices.REVIEWER:
        raise ValidationError("Assigned reviewer must have REVIEWER role.")
    if approver and approver.role != RoleChoices.APPROVER:
        raise ValidationError("Assigned approver must have APPROVER role.")


def _change_project_indicator_status(
    *,
    project_indicator: ProjectIndicator,
    actor,
    to_status: str,
    action: str,
    reason: str = "",
    is_met: bool | None = None,
    is_finalized: bool | None = None,
) -> ProjectIndicator:
    before = snapshot_instance(project_indicator)
    from_status = project_indicator.current_status
    validate_transition(from_status, to_status)
    with allow_workflow_transition():
        project_indicator.current_status = to_status
        if is_met is not None:
            project_indicator.is_met = is_met
        if is_finalized is not None:
            project_indicator.is_finalized = is_finalized
        project_indicator.last_updated_by = actor
        project_indicator.save()
    ProjectIndicatorStatusHistory.objects.create(
        project_indicator=project_indicator,
        from_status=from_status,
        to_status=to_status,
        action=action,
        reason=reason,
        actor=actor,
    )
    log_audit_event(
        actor=actor,
        event_type="project_indicator.status_changed",
        obj=project_indicator,
        before=before,
        after=snapshot_instance(project_indicator),
        reason=reason,
    )
    return project_indicator


@transaction.atomic
def assign_project_indicator(
    *,
    project_indicator: ProjectIndicator,
    actor,
    owner=None,
    reviewer=None,
    approver=None,
    priority=None,
    due_date=None,
    notes=None,
) -> ProjectIndicator:
    ensure_admin_or_lead_access(actor)
    _validate_assignment_roles(owner=owner, reviewer=reviewer, approver=approver)
    before = snapshot_instance(project_indicator)
    project_indicator.owner = owner
    project_indicator.reviewer = reviewer
    project_indicator.approver = approver
    if priority is not None:
        if priority not in PriorityChoices.values:
            raise ValidationError("Unsupported priority.")
        project_indicator.priority = priority
    project_indicator.due_date = due_date
    if notes is not None:
        project_indicator.notes = notes
    project_indicator.last_updated_by = actor
    project_indicator.save()
    log_audit_event(
        actor=actor,
        event_type="project_indicator.assignment_updated",
        obj=project_indicator,
        before=before,
        after=snapshot_instance(project_indicator),
    )
    return project_indicator


@transaction.atomic
def update_project_indicator_working_state(
    *,
    project_indicator: ProjectIndicator,
    actor,
    notes: str,
    due_date=None,
    priority=None,
) -> ProjectIndicator:
    ensure_project_owner_access(actor, project_indicator)
    before = snapshot_instance(project_indicator)
    project_indicator.notes = notes
    if due_date is not None:
        project_indicator.due_date = due_date
    if priority is not None:
        project_indicator.priority = priority
    project_indicator.last_updated_by = actor
    project_indicator.save()
    log_audit_event(
        actor=actor,
        event_type="project_indicator.working_state_updated",
        obj=project_indicator,
        before=before,
        after=snapshot_instance(project_indicator),
    )
    return project_indicator


@transaction.atomic
def add_project_indicator_comment(
    *,
    project_indicator: ProjectIndicator,
    actor,
    comment_type: str,
    text: str,
) -> ProjectIndicatorComment:
    ensure_comment_permission(actor, project_indicator, comment_type)
    comment = ProjectIndicatorComment.objects.create(
        project_indicator=project_indicator,
        type=comment_type,
        text=text,
        created_by=actor,
    )
    log_audit_event(
        actor=actor,
        event_type="project_indicator.comment_added",
        obj=comment,
        before=None,
        after=snapshot_instance(comment),
    )
    return comment


def start_project_indicator(*, project_indicator: ProjectIndicator, actor, reason: str = "") -> ProjectIndicator:
    ensure_project_owner_access(actor, project_indicator)
    return _change_project_indicator_status(
        project_indicator=project_indicator,
        actor=actor,
        to_status=ProjectIndicatorStatusChoices.IN_PROGRESS,
        action="start_project_indicator",
        reason=reason,
        is_met=False,
        is_finalized=False,
    )


def send_project_indicator_for_review(
    *,
    project_indicator: ProjectIndicator,
    actor,
    reason: str = "",
) -> ProjectIndicator:
    ensure_project_owner_access(actor, project_indicator)
    has_work = bool(project_indicator.notes.strip()) or project_indicator.evidence_items.exists()
    if not has_work:
        raise ValidationError("Indicator must have working notes or evidence before review.")
    return _change_project_indicator_status(
        project_indicator=project_indicator,
        actor=actor,
        to_status=ProjectIndicatorStatusChoices.UNDER_REVIEW,
        action="send_project_indicator_for_review",
        reason=reason,
    )


def validate_project_indicator_readiness(project_indicator: ProjectIndicator) -> dict:
    today = timezone.localdate()
    current_evidence = project_indicator.evidence_items.filter(is_current=True)
    approved_current = current_evidence.filter(approval_status="APPROVED")
    rejected_current = current_evidence.filter(approval_status="REJECTED")
    overdue_recurring = project_indicator.recurring_requirement.instances.filter(
        due_date__lt=today,
        status__in=["PENDING", "SUBMITTED", "MISSED"],
    ).count() if hasattr(project_indicator, "recurring_requirement") else 0
    readiness = {
        "approved_evidence_count": approved_current.count(),
        "total_current_evidence_count": current_evidence.count(),
        "rejected_current_evidence_count": rejected_current.count(),
        "minimum_required_evidence_count": project_indicator.indicator.minimum_required_evidence_count,
        "has_minimum_required_evidence": approved_current.count() >= project_indicator.indicator.minimum_required_evidence_count,
        "all_current_evidence_approved": current_evidence.exists() and not current_evidence.exclude(approval_status="APPROVED").exists(),
        "no_rejected_current_evidence": not rejected_current.exists(),
        "overdue_recurring_instances_count": overdue_recurring,
        "recurring_requirements_clear": overdue_recurring == 0,
    }
    readiness["ready_for_met"] = all(
        [
            readiness["has_minimum_required_evidence"],
            readiness["all_current_evidence_approved"],
            readiness["no_rejected_current_evidence"],
            readiness["recurring_requirements_clear"],
        ],
    )
    return readiness


def mark_project_indicator_met(
    *,
    project_indicator: ProjectIndicator,
    actor,
    reason: str = "",
) -> ProjectIndicator:
    ensure_project_approver_access(actor, project_indicator)
    readiness = validate_project_indicator_readiness(project_indicator)
    if not readiness["ready_for_met"]:
        raise ValidationError("Project indicator cannot be marked MET until readiness conditions pass.")
    return _change_project_indicator_status(
        project_indicator=project_indicator,
        actor=actor,
        to_status=ProjectIndicatorStatusChoices.MET,
        action="mark_project_indicator_met",
        reason=reason,
        is_met=True,
        is_finalized=True,
    )


def reopen_project_indicator(
    *,
    project_indicator: ProjectIndicator,
    actor,
    reason: str,
) -> ProjectIndicator:
    ensure_admin_access(actor)
    if not reason.strip():
        raise ValidationError("Reopen requires a reason.")
    return _change_project_indicator_status(
        project_indicator=project_indicator,
        actor=actor,
        to_status=ProjectIndicatorStatusChoices.IN_PROGRESS,
        action="reopen_project_indicator",
        reason=reason,
        is_met=False,
        is_finalized=False,
    )


def standards_progress(project):
    queryset = (
        ProjectIndicator.objects.filter(project=project, indicator__is_active=True)
        .values(
            "indicator__area_id",
            "indicator__area__code",
            "indicator__area__name",
            "indicator__standard_id",
            "indicator__standard__code",
            "indicator__standard__name",
        )
        .annotate(
            total_indicators=Count("id"),
            met_indicators=Count("id", filter=Q(is_met=True)),
            blocked_count=Count("id", filter=Q(current_status=ProjectIndicatorStatusChoices.BLOCKED)),
            in_review_count=Count("id", filter=Q(current_status=ProjectIndicatorStatusChoices.UNDER_REVIEW)),
        )
        .order_by("indicator__area__code", "indicator__standard__code")
    )
    rows = []
    for row in queryset:
        total = row["total_indicators"] or 1
        row["progress_percent"] = round((row["met_indicators"] / total) * 100, 2)
        rows.append(row)
    return rows


def areas_progress(project):
    standards = standards_progress(project)
    grouped: dict[int, dict] = {}
    for row in standards:
        area_id = row["indicator__area_id"]
        item = grouped.setdefault(
            area_id,
            {
                "area_id": area_id,
                "area_code": row["indicator__area__code"],
                "area_name": row["indicator__area__name"],
                "total_standards": 0,
                "completed_standards": 0,
            },
        )
        item["total_standards"] += 1
        if row["total_indicators"] == row["met_indicators"]:
            item["completed_standards"] += 1
    results = []
    for item in grouped.values():
        total = item["total_standards"] or 1
        item["progress_percent"] = round((item["completed_standards"] / total) * 100, 2)
        results.append(item)
    return sorted(results, key=lambda item: item["area_code"])


def recent_audit_summary(project_indicator: ProjectIndicator, limit: int = 8):
    evidence_ids = list(project_indicator.evidence_items.values_list("id", flat=True))
    return AuditEvent.objects.filter(
        Q(object_type="ProjectIndicator", object_id=str(project_indicator.id))
        | Q(object_type="EvidenceItem", object_id__in=[str(value) for value in evidence_ids])
        | Q(object_type="GeneratedOutput", object_id__in=[str(value) for value in project_indicator.generated_outputs.values_list("id", flat=True)])
        | Q(object_type="RecurringEvidenceInstance", object_id__in=[str(value) for value in project_indicator.recurring_requirement.instances.values_list("id", flat=True)])
    ).select_related("actor")[:limit] if hasattr(project_indicator, "recurring_requirement") else AuditEvent.objects.filter(
        Q(object_type="ProjectIndicator", object_id=str(project_indicator.id))
        | Q(object_type="EvidenceItem", object_id__in=[str(value) for value in evidence_ids])
        | Q(object_type="GeneratedOutput", object_id__in=[str(value) for value in project_indicator.generated_outputs.values_list("id", flat=True)])
    ).select_related("actor")[:limit]
