from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.audit.services import log_audit_event, snapshot_instance
from apps.evidence.models import EvidenceItem
from apps.masters.choices import (
    EvidenceApprovalStatusChoices,
    EvidenceCompletenessStatusChoices,
    EvidenceSourceTypeChoices,
    EvidenceValidityStatusChoices,
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
    _validate_source_fields(source_type=source_type, file_or_url=file_or_url, text_content=text_content)
    EvidenceItem.objects.filter(
        project_indicator=project_indicator,
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
