from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.audit.services import log_audit_event, snapshot_instance
from apps.evidence.models import EvidenceItem
from apps.indicators.models import ProjectEvidenceRequirement
from apps.masters.choices import (
    EvidenceApprovalStatusChoices,
    EvidenceCompletenessStatusChoices,
    EvidenceSourceTypeChoices,
    EvidenceValidityStatusChoices,
    ProjectEvidenceRequirementStatusChoices,
)
from apps.workflow.permissions import ensure_project_owner_access, ensure_project_reviewer_access


def _next_version(project_indicator, title: str) -> int:
    latest = (
        EvidenceItem.objects.filter(project_indicator=project_indicator, title=title)
        .order_by("-version_no")
        .first()
    )
    return (latest.version_no + 1) if latest else 1


def _validate_source_fields(*, source_type: str, file_or_url: str, text_content: str) -> None:
    if source_type in {
        EvidenceSourceTypeChoices.UPLOAD,
        EvidenceSourceTypeChoices.URL,
        EvidenceSourceTypeChoices.EXTERNAL_REF,
    } and not file_or_url:
        raise ValidationError("This evidence source type requires file_or_url.")
    if source_type == EvidenceSourceTypeChoices.TEXT_NOTE and not text_content:
        raise ValidationError("TEXT_NOTE evidence requires text_content.")


@transaction.atomic
def create_evidence_item(
    *,
    project_indicator,
    project_evidence_requirement=None,
    actor,
    title: str,
    description: str = "",
    source_type: str,
    file_or_url: str = "",
    text_content: str = "",
    evidence_date=None,
    notes: str = "",
    physical_location_type: str = "",
    location_details: str = "",
    file_label: str = "",
    is_physical_copy_available: bool = False,
) -> EvidenceItem:
    ensure_project_owner_access(actor, project_indicator)
    if project_evidence_requirement and project_evidence_requirement.project_indicator_id != project_indicator.id:
        raise ValidationError("Selected evidence requirement does not belong to this project indicator.")
    _validate_source_fields(source_type=source_type, file_or_url=file_or_url, text_content=text_content)
    EvidenceItem.objects.filter(
        project_indicator=project_indicator,
        project_evidence_requirement=project_evidence_requirement,
        title=title,
        is_current=True,
    ).update(is_current=False)
    evidence_item = EvidenceItem.objects.create(
        project_indicator=project_indicator,
        title=title,
        description=description,
        source_type=source_type,
        file_or_url=file_or_url,
        text_content=text_content,
        version_no=_next_version(project_indicator, title),
        is_current=True,
        evidence_date=evidence_date,
        uploaded_by=actor,
        notes=notes,
        physical_location_type=physical_location_type,
        location_details=location_details,
        file_label=file_label,
        is_physical_copy_available=is_physical_copy_available,
    )
    log_audit_event(
        actor=actor,
        event_type="evidence.created",
        obj=evidence_item,
        before=None,
        after=snapshot_instance(evidence_item),
    )
    return evidence_item


@transaction.atomic
def update_evidence_item(
    *,
    evidence_item: EvidenceItem,
    actor,
    **validated_data,
) -> EvidenceItem:
    ensure_project_owner_access(actor, evidence_item.project_indicator)
    before = snapshot_instance(evidence_item)
    reviewed = evidence_item.reviewed_at is not None or evidence_item.approval_status != EvidenceApprovalStatusChoices.PENDING
    if reviewed:
        new_item = create_evidence_item(
            project_indicator=evidence_item.project_indicator,
            project_evidence_requirement=validated_data.get(
                "project_evidence_requirement",
                evidence_item.project_evidence_requirement,
            ),
            actor=actor,
            title=validated_data.get("title", evidence_item.title),
            description=validated_data.get("description", evidence_item.description),
            source_type=evidence_item.source_type,
            file_or_url=validated_data.get("file_or_url", evidence_item.file_or_url),
            text_content=validated_data.get("text_content", evidence_item.text_content),
            evidence_date=validated_data.get("evidence_date", evidence_item.evidence_date),
            notes=validated_data.get("notes", evidence_item.notes),
            physical_location_type=validated_data.get(
                "physical_location_type",
                evidence_item.physical_location_type,
            ),
            location_details=validated_data.get("location_details", evidence_item.location_details),
            file_label=validated_data.get("file_label", evidence_item.file_label),
            is_physical_copy_available=validated_data.get(
                "is_physical_copy_available",
                evidence_item.is_physical_copy_available,
            ),
        )
        log_audit_event(
            actor=actor,
            event_type="evidence.versioned_on_update",
            obj=new_item,
            before=before,
            after=snapshot_instance(new_item),
        )
        return new_item

    for field, value in validated_data.items():
        setattr(evidence_item, field, value)
    _validate_source_fields(
        source_type=evidence_item.source_type,
        file_or_url=evidence_item.file_or_url,
        text_content=evidence_item.text_content,
    )
    evidence_item.save()
    log_audit_event(
        actor=actor,
        event_type="evidence.updated",
        obj=evidence_item,
        before=before,
        after=snapshot_instance(evidence_item),
    )
    return evidence_item


@transaction.atomic
def review_evidence_item(
    *,
    evidence_item: EvidenceItem,
    actor,
    validity_status: str,
    completeness_status: str,
    approval_status: str,
    review_notes: str = "",
) -> EvidenceItem:
    ensure_project_reviewer_access(actor, evidence_item.project_indicator)
    if validity_status not in EvidenceValidityStatusChoices.values:
        raise ValidationError("Unsupported validity status.")
    if completeness_status not in EvidenceCompletenessStatusChoices.values:
        raise ValidationError("Unsupported completeness status.")
    if approval_status not in EvidenceApprovalStatusChoices.values:
        raise ValidationError("Unsupported approval status.")
    before = snapshot_instance(evidence_item)
    evidence_item.validity_status = validity_status
    evidence_item.completeness_status = completeness_status
    evidence_item.approval_status = approval_status
    evidence_item.reviewed_by = actor
    evidence_item.reviewed_at = timezone.now()
    evidence_item.review_notes = review_notes
    evidence_item.save()
    log_audit_event(
        actor=actor,
        event_type="evidence.reviewed",
        obj=evidence_item,
        before=before,
        after=snapshot_instance(evidence_item),
    )
    return evidence_item


def calculate_project_evidence_readiness(project) -> dict:
    from apps.indicators.capa_services import calculate_project_capa_summary, list_open_capa_for_project
    from apps.indicators.models.capa import Gap
    from apps.masters.choices import PriorityChoices
    
    project_evidence_requirements = (
        ProjectEvidenceRequirement.objects.filter(project=project)
        .select_related("project_indicator__indicator", "evidence_requirement")
        .order_by(
            "project_indicator__indicator__area__sort_order",
            "project_indicator__indicator__standard__sort_order",
            "project_indicator__indicator__sort_order",
            "evidence_requirement__display_order",
            "id",
        )
    )
    current_evidence = EvidenceItem.objects.filter(project_indicator__project=project, is_current=True)
    approved_evidence_items = current_evidence.filter(approval_status=EvidenceApprovalStatusChoices.APPROVED).count()
    unapproved_evidence_items = current_evidence.exclude(approval_status=EvidenceApprovalStatusChoices.APPROVED).count()
    rejected_evidence_items = current_evidence.filter(approval_status=EvidenceApprovalStatusChoices.REJECTED).count()

    mandatory_blockers = []
    for requirement in project_evidence_requirements:
        if requirement.evidence_requirement.mandatory and requirement.status not in {
            ProjectEvidenceRequirementStatusChoices.APPROVED,
            ProjectEvidenceRequirementStatusChoices.NOT_APPLICABLE,
        }:
            mandatory_blockers.append(
                {
                    "project_evidence_requirement_id": requirement.id,
                    "project_indicator_id": requirement.project_indicator_id,
                    "indicator_code": requirement.framework_indicator.code,
                    "requirement_title": requirement.evidence_requirement.title,
                    "status": requirement.status,
                }
            )

    capa_summary = calculate_project_capa_summary(project)
    open_capas = list_open_capa_for_project(project)
    
    capa_blockers = []
    for capa in open_capas:
        is_high_risk = capa.gap.severity in [PriorityChoices.HIGH, PriorityChoices.CRITICAL]
        is_mandatory = capa.project_evidence_requirement and capa.project_evidence_requirement.evidence_requirement.mandatory
        
        if is_high_risk or is_mandatory:
            capa_blockers.append({
                "capa_id": capa.id,
                "capa_title": capa.title,
                "gap_severity": capa.gap.severity,
                "is_mandatory_evidence": is_mandatory,
                "status": capa.status
            })

    total = project_evidence_requirements.count()
    approved = project_evidence_requirements.filter(status=ProjectEvidenceRequirementStatusChoices.APPROVED).count()
    missing = project_evidence_requirements.filter(status=ProjectEvidenceRequirementStatusChoices.MISSING).count()
    partial = project_evidence_requirements.filter(status=ProjectEvidenceRequirementStatusChoices.PARTIAL).count()
    submitted = project_evidence_requirements.filter(status=ProjectEvidenceRequirementStatusChoices.SUBMITTED).count()
    rejected = project_evidence_requirements.filter(status=ProjectEvidenceRequirementStatusChoices.REJECTED).count()
    not_applicable = project_evidence_requirements.filter(status=ProjectEvidenceRequirementStatusChoices.NOT_APPLICABLE).count()
    mandatory_total = project_evidence_requirements.filter(evidence_requirement__mandatory=True).count()
    mandatory_approved = project_evidence_requirements.filter(
        evidence_requirement__mandatory=True,
        status=ProjectEvidenceRequirementStatusChoices.APPROVED,
    ).count()
    mandatory_not_applicable = project_evidence_requirements.filter(
        evidence_requirement__mandatory=True,
        status=ProjectEvidenceRequirementStatusChoices.NOT_APPLICABLE,
    ).count()
    
    export_ready = (
        mandatory_total == (mandatory_approved + mandatory_not_applicable) 
        and not mandatory_blockers 
        and not capa_blockers
    )
    readiness_percent = 100.0 if total == 0 else round((approved / total) * 100, 2)
    
    return {
        "total": total,
        "approved": approved,
        "missing": missing,
        "partial": partial,
        "submitted": submitted,
        "rejected": rejected,
        "not_applicable": not_applicable,
        "mandatory_total": mandatory_total,
        "mandatory_approved": mandatory_approved,
        "mandatory_not_applicable": mandatory_not_applicable,
        "mandatory_blockers": mandatory_blockers,
        "approved_evidence_items": approved_evidence_items,
        "unapproved_evidence_items": unapproved_evidence_items,
        "rejected_evidence_items": rejected_evidence_items,
        "readiness_percent": readiness_percent,
        "export_ready": export_ready,
        "open_gap_count": Gap.objects.filter(project=project, status__in=["OPEN", "LINKED_TO_CAPA"]).count(),
        "open_capa_count": capa_summary["open_capa_count"],
        "high_risk_capa_count": capa_summary["high_risk_capa_count"],
        "overdue_capa_count": capa_summary["overdue_capa_count"],
        "capa_blockers": capa_blockers,
    }
