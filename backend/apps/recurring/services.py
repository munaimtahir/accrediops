import calendar
from datetime import timedelta

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.audit.services import log_audit_event, snapshot_instance
from apps.evidence.services import create_evidence_item, review_evidence_item
from apps.masters.choices import (
    EvidenceApprovalStatusChoices,
    EvidenceCompletenessStatusChoices,
    EvidenceSourceTypeChoices,
    EvidenceValidityStatusChoices,
    RecurrenceFrequencyChoices,
    RecurrenceModeChoices,
    RecurringInstanceStatusChoices,
)
from apps.recurring.models import RecurringEvidenceInstance, RecurringRequirement
from apps.workflow.permissions import ensure_project_owner_access, ensure_project_reviewer_access


def _period_label(due_date, frequency: str) -> str:
    if frequency == RecurrenceFrequencyChoices.DAILY:
        return due_date.isoformat()
    if frequency == RecurrenceFrequencyChoices.WEEKLY:
        year, week, _ = due_date.isocalendar()
        return f"{year}-W{week:02d}"
    if frequency == RecurrenceFrequencyChoices.MONTHLY:
        return due_date.strftime("%Y-%m")
    return due_date.strftime("%Y")


def _advance_date(current_date, frequency: str):
    if frequency == RecurrenceFrequencyChoices.DAILY:
        return current_date + timedelta(days=1)
    if frequency == RecurrenceFrequencyChoices.WEEKLY:
        return current_date + timedelta(days=7)
    if frequency == RecurrenceFrequencyChoices.MONTHLY:
        month = current_date.month + 1
        year = current_date.year
        if month > 12:
            month = 1
            year += 1
        day = min(current_date.day, calendar.monthrange(year, month)[1])
        return current_date.replace(year=year, month=month, day=day)
    if frequency == RecurrenceFrequencyChoices.YEARLY:
        year = current_date.year + 1
        day = min(current_date.day, calendar.monthrange(year, current_date.month)[1])
        return current_date.replace(year=year, day=day)
    raise ValidationError("Unsupported recurrence frequency.")


@transaction.atomic
def ensure_recurring_requirement_for_project_indicator(*, project_indicator, actor) -> RecurringRequirement:
    indicator = project_indicator.indicator
    if not indicator.is_recurring:
        raise ValidationError("Project indicator is not recurring.")
    requirement, created = RecurringRequirement.objects.get_or_create(
        project_indicator=project_indicator,
        defaults={
            "frequency": indicator.recurrence_frequency,
            "mode": indicator.recurrence_mode,
            "start_date": project_indicator.project.start_date,
            "end_date": project_indicator.project.target_date,
            "instructions": indicator.fulfillment_guidance,
            "expected_title_template": indicator.code,
        },
    )
    if created:
        log_audit_event(
            actor=actor,
            event_type="recurring.requirement_created",
            obj=requirement,
            before=None,
            after=snapshot_instance(requirement),
        )
    return requirement


@transaction.atomic
def generate_recurring_instances(*, recurring_requirement: RecurringRequirement, actor, until_date=None) -> int:
    if not recurring_requirement.is_active:
        return 0
    until_date = until_date or timezone.localdate()
    if recurring_requirement.end_date:
        until_date = min(until_date, recurring_requirement.end_date)
    current = recurring_requirement.start_date
    created = 0
    while current <= until_date:
        _, was_created = RecurringEvidenceInstance.objects.get_or_create(
            recurring_requirement=recurring_requirement,
            due_date=current,
            defaults={
                "period_label": _period_label(current, recurring_requirement.frequency),
                "status": RecurringInstanceStatusChoices.PENDING,
            },
        )
        if was_created:
            created += 1
        current = _advance_date(current, recurring_requirement.frequency)
    if created:
        log_audit_event(
            actor=actor,
            event_type="recurring.instances_generated",
            obj=recurring_requirement,
            before=None,
            after={"created_instances": created, "until_date": until_date.isoformat()},
        )
    return created


@transaction.atomic
def submit_recurring_instance(
    *,
    recurring_instance: RecurringEvidenceInstance,
    actor,
    evidence_item=None,
    text_content: str = "",
    notes: str = "",
) -> RecurringEvidenceInstance:
    ensure_project_owner_access(actor, recurring_instance.recurring_requirement.project_indicator)
    requirement = recurring_instance.recurring_requirement
    if evidence_item and evidence_item.project_indicator_id != requirement.project_indicator_id:
        raise ValidationError("Evidence item must belong to the same project indicator.")
    if evidence_item is None:
        if requirement.mode == RecurrenceModeChoices.UPLOAD:
            raise ValidationError("This recurring requirement requires an uploaded evidence item.")
        if not text_content.strip():
            raise ValidationError("Digital recurring submission requires text content.")
        evidence_item = create_evidence_item(
            project_indicator=requirement.project_indicator,
            actor=actor,
            title=requirement.expected_title_template or requirement.project_indicator.indicator.code,
            description=requirement.instructions,
            source_type=EvidenceSourceTypeChoices.TEXT_NOTE,
            text_content=text_content,
            notes=notes,
            evidence_date=recurring_instance.due_date,
        )
    before = snapshot_instance(recurring_instance)
    recurring_instance.linked_evidence_item = evidence_item
    recurring_instance.status = RecurringInstanceStatusChoices.SUBMITTED
    recurring_instance.submitted_at = timezone.now()
    recurring_instance.notes = notes
    recurring_instance.save()
    log_audit_event(
        actor=actor,
        event_type="recurring.instance_submitted",
        obj=recurring_instance,
        before=before,
        after=snapshot_instance(recurring_instance),
    )
    return recurring_instance


@transaction.atomic
def approve_recurring_instance(
    *,
    recurring_instance: RecurringEvidenceInstance,
    actor,
    approval_status: str,
    notes: str = "",
) -> RecurringEvidenceInstance:
    ensure_project_reviewer_access(actor, recurring_instance.recurring_requirement.project_indicator)
    if approval_status not in {
        EvidenceApprovalStatusChoices.APPROVED,
        EvidenceApprovalStatusChoices.REJECTED,
    }:
        raise ValidationError("Recurring approval_status must be APPROVED or REJECTED.")
    before = snapshot_instance(recurring_instance)
    if recurring_instance.linked_evidence_item:
        review_evidence_item(
            evidence_item=recurring_instance.linked_evidence_item,
            actor=actor,
            validity_status=EvidenceValidityStatusChoices.VALID if approval_status == EvidenceApprovalStatusChoices.APPROVED else EvidenceValidityStatusChoices.INVALID,
            completeness_status=EvidenceCompletenessStatusChoices.COMPLETE if approval_status == EvidenceApprovalStatusChoices.APPROVED else EvidenceCompletenessStatusChoices.INCOMPLETE,
            approval_status=approval_status,
            review_notes=notes,
        )
    if approval_status == EvidenceApprovalStatusChoices.APPROVED:
        recurring_instance.status = RecurringInstanceStatusChoices.APPROVED
        recurring_instance.approved_at = timezone.now()
    else:
        recurring_instance.status = (
            RecurringInstanceStatusChoices.MISSED
            if recurring_instance.due_date < timezone.localdate()
            else RecurringInstanceStatusChoices.PENDING
        )
        recurring_instance.approved_at = None
    recurring_instance.notes = notes
    recurring_instance.save()
    log_audit_event(
        actor=actor,
        event_type="recurring.instance_reviewed",
        obj=recurring_instance,
        before=before,
        after=snapshot_instance(recurring_instance),
        reason=notes,
    )
    return recurring_instance
