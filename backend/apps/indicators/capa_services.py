from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.audit.services import log_audit_event, snapshot_instance
from apps.indicators.models import (
    ProjectIndicator,
    ProjectEvidenceRequirement,
)
from apps.indicators.models.capa import Gap, CAPA
from apps.masters.choices import (
    GapSourceChoices,
    GapStatusChoices,
    CapaStatusChoices,
    PriorityChoices,
)
from apps.workflow.permissions import (
    ensure_admin_or_lead_access,
    ensure_project_owner_access,
    ensure_project_reviewer_access,
    ensure_project_approver_access,
)


@transaction.atomic
def create_gap_from_project_evidence_requirement(
    *,
    actor,
    project_evidence_requirement: ProjectEvidenceRequirement,
    title: str,
    description: str,
    severity: str = PriorityChoices.MEDIUM,
) -> Gap:
    ensure_project_owner_access(actor, project_evidence_requirement.project_indicator)
    
    source = GapSourceChoices.MISSING_EVIDENCE
    if project_evidence_requirement.status == "REJECTED":
        source = GapSourceChoices.REJECTED_EVIDENCE
    elif project_evidence_requirement.status == "PARTIAL":
        source = GapSourceChoices.PARTIAL_EVIDENCE

    gap = Gap.objects.create(
        project=project_evidence_requirement.project,
        project_indicator=project_evidence_requirement.project_indicator,
        project_evidence_requirement=project_evidence_requirement,
        evidence_requirement=project_evidence_requirement.evidence_requirement,
        title=title,
        description=description,
        severity=severity,
        source=source,
        created_by=actor,
    )
    
    log_audit_event(
        actor=actor,
        event_type="gap.created",
        obj=gap,
        before=None,
        after=snapshot_instance(gap),
    )
    return gap


@transaction.atomic
def create_manual_gap(
    *,
    actor,
    project_indicator: ProjectIndicator,
    title: str,
    description: str,
    severity: str = PriorityChoices.MEDIUM,
) -> Gap:
    ensure_project_owner_access(actor, project_indicator)
    
    gap = Gap.objects.create(
        project=project_indicator.project,
        project_indicator=project_indicator,
        title=title,
        description=description,
        severity=severity,
        source=GapSourceChoices.MANUAL,
        created_by=actor,
    )
    
    log_audit_event(
        actor=actor,
        event_type="gap.created",
        obj=gap,
        before=None,
        after=snapshot_instance(gap),
    )
    return gap


@transaction.atomic
def create_capa_from_gap(
    *,
    actor,
    gap: Gap,
    title: str,
    root_cause: str = "",
    corrective_action: str = "",
    preventive_action: str = "",
    responsible_person=None,
    due_date=None,
) -> CAPA:
    ensure_project_owner_access(actor, gap.project_indicator)
    
    # Enforce 1 active CAPA per gap logic if desired, or just create it.
    if gap.capas.filter(status__in=[CapaStatusChoices.OPEN, CapaStatusChoices.IN_PROGRESS, CapaStatusChoices.SUBMITTED_FOR_REVIEW]).exists():
        raise ValidationError("An active CAPA already exists for this gap.")
        
    capa = CAPA.objects.create(
        project=gap.project,
        gap=gap,
        project_indicator=gap.project_indicator,
        project_evidence_requirement=gap.project_evidence_requirement,
        title=title,
        root_cause=root_cause,
        corrective_action=corrective_action,
        preventive_action=preventive_action,
        responsible_person=responsible_person,
        due_date=due_date,
        created_by=actor,
    )
    
    # Update gap status
    before_gap = snapshot_instance(gap)
    gap.status = GapStatusChoices.LINKED_TO_CAPA
    gap.save()
    
    log_audit_event(
        actor=actor,
        event_type="capa.created",
        obj=capa,
        before=None,
        after=snapshot_instance(capa),
    )
    return capa


@transaction.atomic
def update_capa(
    *,
    actor,
    capa: CAPA,
    title: str | None = None,
    root_cause: str | None = None,
    corrective_action: str | None = None,
    preventive_action: str | None = None,
    responsible_person=None,
    due_date=None,
) -> CAPA:
    # Owners/Leads or the responsible person can update it
    # We will just use the standard ensure_project_owner_access, but a real system might allow responsible_person too.
    ensure_project_owner_access(actor, capa.project_indicator)
    
    before = snapshot_instance(capa)
    
    if title is not None:
        capa.title = title
    if root_cause is not None:
        capa.root_cause = root_cause
    if corrective_action is not None:
        capa.corrective_action = corrective_action
    if preventive_action is not None:
        capa.preventive_action = preventive_action
    if responsible_person is not None:
        capa.responsible_person = responsible_person
    if due_date is not None:
        capa.due_date = due_date
        
    if capa.status == CapaStatusChoices.OPEN:
        capa.status = CapaStatusChoices.IN_PROGRESS
        
    capa.full_clean()
    capa.save()
    
    log_audit_event(
        actor=actor,
        event_type="capa.updated",
        obj=capa,
        before=before,
        after=snapshot_instance(capa),
    )
    return capa


@transaction.atomic
def submit_capa_for_review(
    *,
    actor,
    capa: CAPA,
) -> CAPA:
    ensure_project_owner_access(actor, capa.project_indicator)
    before = snapshot_instance(capa)
    
    capa.status = CapaStatusChoices.SUBMITTED_FOR_REVIEW
    capa.submitted_by = actor
    capa.submitted_at = timezone.now()
    capa.save()
    
    log_audit_event(
        actor=actor,
        event_type="capa.submitted",
        obj=capa,
        before=before,
        after=snapshot_instance(capa),
    )
    return capa


@transaction.atomic
def close_capa(
    *,
    actor,
    capa: CAPA,
    closure_notes: str,
    closure_evidence=None,
) -> CAPA:
    ensure_project_approver_access(actor, capa.project_indicator)
    before = snapshot_instance(capa)
    
    capa.status = CapaStatusChoices.CLOSED
    capa.closure_notes = closure_notes
    if closure_evidence:
        capa.closure_evidence = closure_evidence
    
    capa.closed_by = actor
    capa.closed_at = timezone.now()
    capa.save()
    
    # Resolve the gap
    before_gap = snapshot_instance(capa.gap)
    capa.gap.status = GapStatusChoices.RESOLVED
    capa.gap.save()
    log_audit_event(
        actor=actor,
        event_type="gap.resolved",
        obj=capa.gap,
        before=before_gap,
        after=snapshot_instance(capa.gap),
    )
    
    log_audit_event(
        actor=actor,
        event_type="capa.closed",
        obj=capa,
        before=before,
        after=snapshot_instance(capa),
    )
    return capa


@transaction.atomic
def reject_capa(
    *,
    actor,
    capa: CAPA,
    rejection_reason: str,
) -> CAPA:
    ensure_project_approver_access(actor, capa.project_indicator)
    if not rejection_reason.strip():
        raise ValidationError("Rejection reason is required.")
        
    before = snapshot_instance(capa)
    
    capa.status = CapaStatusChoices.REJECTED
    capa.rejection_reason = rejection_reason
    capa.reviewed_by = actor
    capa.reviewed_at = timezone.now()
    capa.save()
    
    # Gap goes back to open
    before_gap = snapshot_instance(capa.gap)
    capa.gap.status = GapStatusChoices.OPEN
    capa.gap.save()
    
    log_audit_event(
        actor=actor,
        event_type="capa.rejected",
        obj=capa,
        before=before,
        after=snapshot_instance(capa),
    )
    return capa


def calculate_project_capa_summary(project) -> dict:
    all_capas = CAPA.objects.filter(project=project)
    active_capas = all_capas.filter(
        status__in=[
            CapaStatusChoices.OPEN,
            CapaStatusChoices.IN_PROGRESS,
            CapaStatusChoices.SUBMITTED_FOR_REVIEW,
            CapaStatusChoices.REJECTED,
        ]
    )
    return {
        "total_capa": all_capas.count(),
        "open_capa_count": all_capas.filter(status__in=[CapaStatusChoices.OPEN, CapaStatusChoices.IN_PROGRESS]).count(),
        "in_progress_capa_count": all_capas.filter(status=CapaStatusChoices.IN_PROGRESS).count(),
        "submitted_capa_count": all_capas.filter(status=CapaStatusChoices.SUBMITTED_FOR_REVIEW).count(),
        "closed_capa_count": all_capas.filter(status=CapaStatusChoices.CLOSED).count(),
        "rejected_capa_count": all_capas.filter(status=CapaStatusChoices.REJECTED).count(),
        "cancelled_capa_count": all_capas.filter(status=CapaStatusChoices.CANCELLED).count(),
        "high_risk_capa_count": all_capas.filter(status__in=[CapaStatusChoices.OPEN, CapaStatusChoices.IN_PROGRESS, CapaStatusChoices.SUBMITTED_FOR_REVIEW], gap__severity__in=[PriorityChoices.HIGH, PriorityChoices.CRITICAL]).count(),
        "overdue_capa_count": all_capas.filter(status__in=[CapaStatusChoices.OPEN, CapaStatusChoices.IN_PROGRESS], due_date__lt=timezone.localdate()).count(),
        "export_blocker_count": active_capas.filter(
            Q(gap__severity__in=[PriorityChoices.HIGH, PriorityChoices.CRITICAL])
            | Q(project_evidence_requirement__evidence_requirement__mandatory=True)
        ).count(),
    }


def list_open_capa_for_project(project):
    return CAPA.objects.filter(
        project=project, 
        status__in=[CapaStatusChoices.OPEN, CapaStatusChoices.IN_PROGRESS, CapaStatusChoices.SUBMITTED_FOR_REVIEW, CapaStatusChoices.REJECTED]
    )
