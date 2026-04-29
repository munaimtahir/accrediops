import re

from django.core.exceptions import PermissionDenied
from django.utils import timezone

from apps.audit.services import log_audit_event, snapshot_instance
from apps.evidence.models import EvidenceItem
from apps.exports.models import ExportJob, ImportLog, PrintPackItem
from apps.projects.models import AccreditationProject

PLACEHOLDER_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")


def replace_variables(text: str, client_profile) -> str:
    if not text or client_profile is None:
        return text

    fields = {
        "organization_name": client_profile.organization_name,
        "address": client_profile.address,
        "license_number": client_profile.license_number,
        "registration_number": client_profile.registration_number,
        "contact_person": client_profile.contact_person,
    }

    def _replace(match):
        key = match.group(1)
        return str(fields.get(key, match.group(0)) or "")

    return PLACEHOLDER_PATTERN.sub(_replace, text)


def build_print_bundle(project: AccreditationProject) -> dict:
    project_indicators = (
        project.project_indicators.select_related(
            "indicator__area",
            "indicator__standard",
        )
        .prefetch_related("evidence_items", "print_pack_items")
        .all()
    )

    sections_index: dict[tuple[int, str], dict] = {}
    for project_indicator in project_indicators:
        indicator = project_indicator.indicator
        area = indicator.area
        standard = indicator.standard
        section_key = (area.sort_order, area.name)
        section = sections_index.setdefault(
            section_key,
            {
                "name": area.name,
                "standards": {},
            },
        )
        standard_key = (standard.sort_order, standard.name)
        standard_bucket = section["standards"].setdefault(
            standard_key,
            {
                "name": standard.name,
                "indicators": [],
            },
        )

        evidence_qs = project_indicator.evidence_items.filter(is_current=True).order_by("uploaded_at", "id")
        overrides = {
            item.evidence_item_id: item
            for item in project_indicator.print_pack_items.all()
        }
        evidence_list = []
        for idx, evidence in enumerate(evidence_qs, start=1):
            override = overrides.get(evidence.id)
            evidence_list.append(
                {
                    "id": evidence.id,
                    "title": evidence.title,
                    "approval_status": evidence.approval_status,
                    "source_type": evidence.source_type,
                    "order": override.order if override else idx,
                    "notes": override.notes if override else "",
                    "physical_location_type": evidence.physical_location_type,
                    "location_details": evidence.location_details,
                    "file_label": evidence.file_label,
                    "is_physical_copy_available": evidence.is_physical_copy_available,
                }
            )
        evidence_list.sort(key=lambda item: (item["order"], item["id"]))

        standard_bucket["indicators"].append(
            {
                "project_indicator_id": project_indicator.id,
                "indicator_code": indicator.code,
                "indicator_text": indicator.text,
                "status": project_indicator.current_status,
                "evidence_list": evidence_list,
                "notes": project_indicator.notes,
                "reusable_template_allowed": indicator.reusable_template_allowed,
                "evidence_reuse_policy": indicator.evidence_reuse_policy,
            }
        )

    ordered_sections = []
    for (_, _), section in sorted(sections_index.items(), key=lambda item: item[0]):
        standards = []
        for (_, _), standard in sorted(section["standards"].items(), key=lambda item: item[0]):
            standards.append(standard)
        ordered_sections.append({"name": section["name"], "standards": standards})

    return {"sections": ordered_sections}


def upsert_print_pack_items(project: AccreditationProject) -> int:
    created = 0
    for project_indicator in project.project_indicators.all():
        evidence_items = EvidenceItem.objects.filter(project_indicator=project_indicator, is_current=True).order_by(
            "uploaded_at",
            "id",
        )
        for idx, evidence_item in enumerate(evidence_items, start=1):
            _, was_created = PrintPackItem.objects.get_or_create(
                project_indicator=project_indicator,
                evidence_item=evidence_item,
                defaults={
                    "order": idx,
                    "section_name": project_indicator.indicator.area.name,
                    "notes": "",
                },
            )
            if was_created:
                created += 1
    return created


def classify_indicator_risk(project_indicator, today=None) -> dict:
    today = today or timezone.localdate()
    current_evidence = project_indicator.evidence_items.filter(is_current=True)
    rejected_count = current_evidence.filter(approval_status="REJECTED").count()
    incomplete_count = current_evidence.filter(completeness_status="INCOMPLETE").count()
    overdue_recurring = (
        project_indicator.recurring_requirement.instances.filter(
            due_date__lt=today,
            status__in=["PENDING", "SUBMITTED", "MISSED"],
        ).count()
        if hasattr(project_indicator, "recurring_requirement")
        else 0
    )
    near_due = bool(
        project_indicator.due_date
        and (project_indicator.due_date - today).days <= 3
        and project_indicator.due_date >= today
    )
    no_evidence_near_due = near_due and not current_evidence.exists()
    in_review_long = project_indicator.current_status == "UNDER_REVIEW" and (
        (today - project_indicator.last_updated_at.date()).days >= 7
    )
    if rejected_count > 0 or overdue_recurring > 0 or no_evidence_near_due:
        risk = "HIGH"
    elif incomplete_count > 0 or in_review_long:
        risk = "MEDIUM"
    else:
        risk = "LOW"
    return {
        "risk_level": risk,
        "rejected_evidence_count": rejected_count,
        "overdue_recurring_count": overdue_recurring,
        "incomplete_evidence_count": incomplete_count,
        "no_evidence_near_due": no_evidence_near_due,
        "in_review_long_time": in_review_long,
    }


def export_validation_warnings(project: AccreditationProject) -> list[dict]:
    warnings: list[dict] = []
    for item in project.project_indicators.select_related("indicator").prefetch_related("evidence_items"):
        current_evidence = item.evidence_items.filter(is_current=True)
        unapproved = current_evidence.exclude(approval_status="APPROVED").count()
        missing = max(item.indicator.minimum_required_evidence_count - current_evidence.filter(approval_status="APPROVED").count(), 0)
        overdue = (
            item.recurring_requirement.instances.filter(
                due_date__lt=timezone.localdate(),
                status__in=["PENDING", "SUBMITTED", "MISSED"],
            ).count()
            if hasattr(item, "recurring_requirement")
            else 0
        )
        if unapproved or missing or overdue:
            warnings.append(
                {
                    "project_indicator_id": item.id,
                    "indicator_code": item.indicator.code,
                    "unapproved_evidence_count": unapproved,
                    "missing_evidence_count": missing,
                    "overdue_recurring_count": overdue,
                }
            )
    return warnings


def export_eligibility_report(project: AccreditationProject, export_type: str) -> dict:
    from apps.exports.services_admin import project_readiness

    readiness = project_readiness(project)
    warnings = export_validation_warnings(project)
    pending_indicators = list(
        project.project_indicators.select_related("indicator")
        .exclude(current_status="MET")
        .order_by("indicator__code")
    )
    reasons: list[str] = []

    if pending_indicators:
        pending_preview = ", ".join(item.indicator.code for item in pending_indicators[:3])
        reasons.append(
            f"project has {len(pending_indicators)} indicator(s) still pending approval or completion ({pending_preview})."
        )
    if readiness["high_risk_indicators"]:
        reasons.append(
            f"project has {len(readiness['high_risk_indicators'])} critical high-risk indicator(s) pending."
        )
    if readiness["recurring_compliance_score"] < 100:
        reasons.append(
            f"recurring compliance is {readiness['recurring_compliance_score']}% and must be 100%."
        )
    if warnings:
        reasons.append(
            f"approval completeness is not satisfied for {len(warnings)} indicator(s)."
        )

    return {
        "eligible": not reasons,
        "export_type": export_type,
        "project_id": project.id,
        "readiness": readiness,
        "warnings": warnings,
        "pending_indicator_count": len(pending_indicators),
        "reasons": reasons,
    }


def enforce_export_eligibility(project: AccreditationProject, export_type: str) -> dict:
    report = export_eligibility_report(project, export_type)
    if report["eligible"]:
        return report
    raise PermissionDenied(f"Export blocked: {' '.join(report['reasons'])}")


def log_export_audit(*, project: AccreditationProject, actor, export_type: str, event_type: str, details: dict | None = None):
    payload = {
        "project_id": project.id,
        "export_type": export_type,
        **(details or {}),
    }
    return log_audit_event(
        actor=actor,
        event_type=event_type,
        obj=project,
        before=None,
        after=payload,
        reason=export_type,
    )


def create_export_job(*, project: AccreditationProject, actor, export_type: str, parameters: dict | None = None) -> ExportJob:
    report = enforce_export_eligibility(project, export_type)
    job = ExportJob.objects.create(
        project=project,
        type=export_type,
        created_by=actor if getattr(actor, "is_authenticated", False) else None,
        status="READY",
        file_name=f"{project.name}-{export_type}.json",
        parameters={
            **(parameters or {}),
            "eligibility_snapshot": {
                "pending_indicator_count": report["pending_indicator_count"],
                "reasons": report["reasons"],
            },
        },
        warnings=[],
    )
    log_audit_event(
        actor=actor,
        event_type="export.job_created",
        obj=job,
        before=None,
        after=snapshot_instance(job),
        reason=export_type,
    )
    return job


def validate_framework_import_rows(rows: list[dict]) -> dict:
    seen = set()
    errors = []
    for index, row in enumerate(rows, start=1):
        required = ["area_code", "standard_code", "indicator_code", "indicator_text"]
        missing = [key for key in required if not row.get(key)]
        if missing:
            errors.append({"row": index, "error": "missing_fields", "fields": missing})
            continue
        key = (row["area_code"], row["standard_code"], row["indicator_code"])
        if key in seen:
            errors.append({"row": index, "error": "duplicate_indicator_hierarchy"})
        seen.add(key)
    return {"rows_processed": len(rows), "errors": errors}


def log_framework_import(*, file_name: str, rows_processed: int, errors: list[dict]) -> ImportLog:
    return ImportLog.objects.create(
        file_name=file_name,
        rows_processed=rows_processed,
        errors=errors,
    )
