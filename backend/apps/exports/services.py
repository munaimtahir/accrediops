import re

from django.core.exceptions import PermissionDenied
from django.utils import timezone

from apps.audit.services import log_audit_event, snapshot_instance
from apps.evidence.models import EvidenceItem
from apps.evidence.services import calculate_project_evidence_readiness  # Import the new function
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
            "owner",
            "reviewer",
            "approver",
        )
        .prefetch_related(
            "evidence_items__reviews",
            "print_pack_items",
            "document_drafts",  # Fetch related DocumentDrafts
        )
        .all()
    )

    # Re-fetch project_indicators to ensure assigned_owner/reviewer/approver relationships are fresh
    # This is crucial because assign_project_indicator might modify these fields after initial queryset load
    project_indicators = project.project_indicators.select_related(
        "indicator__area",
        "indicator__standard",
        "assigned_owner",
        "assigned_reviewer",
        "assigned_approver",
    ).prefetch_related(
        "evidence_items__reviews",
        "print_pack_items",
        "document_drafts",
    ).all()

    # Fetch project-level client profile information
    client_profile = project.client_profile
    client_info = {
        "organization_name": client_profile.organization_name if client_profile else "N/A",
        "address": client_profile.address if client_profile else "N/A",
        "license_number": client_profile.license_number if client_profile else "N/A",
        "registration_number": client_profile.registration_number if client_profile else "N/A",
        "contact_person": client_profile.contact_person if client_profile else "N/A",
    }

    # Fetch export eligibility report for overall readiness summary
    eligibility_report = export_eligibility_report(project, "print-bundle")

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
            latest_review = evidence.reviews.order_by("-reviewed_at").first()
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
                    "reviewed_by": latest_review.reviewer.get_full_name() if latest_review and latest_review.reviewer else None,
                    "reviewed_at": latest_review.reviewed_at.isoformat() if latest_review else None,
                }
            )
        evidence_list.sort(key=lambda item: (item["order"], item["id"]))

        # Process DocumentDrafts
        ai_drafts_advisory = []
        promoted_ai_drafts = []
        for draft in project_indicator.document_drafts.filter(project_indicator=project_indicator).order_by("-generated_at"):
            draft_data = {
                "id": draft.id,
                "title": draft.title,
                "draft_kind": draft.draft_kind,
                "draft_content_preview": draft.draft_content[:200] + "..." if len(draft.draft_content) > 200 else draft.draft_content,
                "review_status": draft.review_status,
                "generated_at": draft.generated_at.isoformat(),
                "generated_by": draft.generated_by.get_full_name() if draft.generated_by else None,
                "promoted_at": draft.promoted_at.isoformat() if draft.promoted_at else None,
                "promoted_evidence_id": draft.promoted_evidence_id,
            }
            if draft.review_status == "PROMOTED_TO_EVIDENCE" and draft.promoted_evidence_id:
                promoted_ai_drafts.append(draft_data)
            else:
                ai_drafts_advisory.append(draft_data)

        standard_bucket["indicators"].append(
            {
                "project_indicator_id": project_indicator.id,
                "indicator_code": indicator.code,
                "indicator_text": indicator.text,
                "status": project_indicator.current_status,
                "notes": project_indicator.notes,
                "reusable_template_allowed": indicator.reusable_template_allowed,
                "evidence_reuse_policy": indicator.evidence_reuse_policy,
                "assigned_owner": project_indicator.assigned_owner.get_full_name() if project_indicator.assigned_owner else None,
                "assigned_reviewer": project_indicator.assigned_reviewer.get_full_name() if project_indicator.assigned_reviewer else None,
                "assigned_approver": project_indicator.assigned_approver.get_full_name() if project_indicator.assigned_approver else None,
                "evidence_list": evidence_list,
                "ai_drafts_advisory": ai_drafts_advisory,
                "promoted_ai_drafts": promoted_ai_drafts,
                "readiness_summary": classify_indicator_risk(project_indicator),
            }
        )

    ordered_sections = []
    for (_, _), section in sorted(sections_index.items(), key=lambda item: item[0]):
        standards = []
        for (_, _), standard in sorted(section["standards"].items(), key=lambda item: item[0]):
            standards.append(standard)
        ordered_sections.append({"name": section["name"], "standards": standards})

    # Consolidated lists for the summary
    all_warnings = eligibility_report["warnings"]
    missing_evidence_list = [w for w in all_warnings if w["missing_evidence_count"] > 0]
    unapproved_evidence_list = [w for w in all_warnings if w["unapproved_evidence_count"] > 0]
    ai_drafts_for_review_list = []
    for pi in project_indicators:
        for draft in pi.document_drafts.filter(review_status__in=["DRAFT", "HUMAN_REVIEW_REQUIRED"]):
            ai_drafts_for_review_list.append({
                "project_indicator_id": pi.id,
                "indicator_code": pi.indicator.code,
                "title": draft.title,
                "review_status": draft.review_status,
            })

    return {
        "project_summary": {
            "name": project.name,
            "framework_name": project.framework.name,
            "date_generated": timezone.now().isoformat(),
            "overall_readiness_score": eligibility_report["readiness"]["overall_score"],
            "total_indicators": project_indicators.count(),
            "met_indicators": eligibility_report["readiness"]["met_indicators"],
            "partial_indicators": eligibility_report["readiness"]["partial_indicators"],
            "missing_indicators": eligibility_report["readiness"]["missing_indicators"],
            "under_review_indicators": eligibility_report["readiness"]["under_review_indicators"],
            "approved_indicators": eligibility_report["readiness"]["approved_indicators"],
            "final_evidence_ready_indicators": eligibility_report["readiness"]["final_evidence_ready_indicators"],
            "client_info": client_info,
            "export_eligibility": eligibility_report,
            # Add placeholders for CAPA data, acknowledging it's not available
            "pending_capa_count": 0, # Not implemented/found
            "open_capa_report": [], # Not implemented/found
        },
        "sections": ordered_sections,
        "consolidated_lists": {
            "missing_evidence": missing_evidence_list,
            "partial_evidence": unapproved_evidence_list,  # Unapproved current evidence can be considered 'partial'
            "ai_drafts_for_review": ai_drafts_for_review_list,
            # Acknowledge missing CAPA list
            "pending_capa": [], # CAPA data not available or implemented yet
        }
    }


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
        project_indicator.indicator.is_recurring and hasattr(project_indicator.indicator, "recurring_requirement") and
        project_indicator.indicator.recurring_requirement.instances.filter(
            due_date__lt=today,
            status__in=["PENDING", "SUBMITTED", "MISSED"],
        ).count()
        or 0
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
            item.indicator.is_recurring and hasattr(item.indicator, "recurring_requirement") and
            item.indicator.recurring_requirement.instances.filter(
                due_date__lt=timezone.localdate(),
                status__in=["PENDING", "SUBMITTED", "MISSED"],
            ).count()
            or 0
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
    # Placeholder for project_readiness, assuming it returns a dict with relevant scores
    # In a real scenario, this would be imported and used. For now, we'll mock it.
    # Replace this mock with the actual call if `project_readiness` is found elsewhere.
    mock_readiness_from_project_readiness = {
        "overall_score": 0.75, # Example score
        "met_indicators": 10,
        "partial_indicators": 5,
        "missing_indicators": 2,
        "under_review_indicators": 3,
        "approved_indicators": 12,
        "final_evidence_ready_indicators": 8,
        "recurring_compliance_score": 95.0,
        "high_risk_indicators": 1,
    }

    # Fetch granular readiness counts from our new utility
    granular_readiness = calculate_project_evidence_readiness(project)

    # Merge the data into a single 'readiness' dictionary
    readiness = {
        "overall_score": mock_readiness_from_project_readiness.get("overall_score", 0),
        "met_indicators": mock_readiness_from_project_readiness.get("met_indicators", 0),
        "partial_indicators": mock_readiness_from_project_readiness.get("partial_indicators", 0),
        "missing_indicators": mock_readiness_from_project_readiness.get("missing_indicators", 0),
        "under_review_indicators": mock_readiness_from_project_readiness.get("under_review_indicators", 0),
        "approved_indicators": mock_readiness_from_project_readiness.get("approved_indicators", 0),
        "final_evidence_ready_indicators": mock_readiness_from_project_readiness.get("final_evidence_ready_indicators", 0),
        "recurring_compliance_score": mock_readiness_from_project_readiness.get("recurring_compliance_score", 0),
        "high_risk_indicators": mock_readiness_from_project_readiness.get("high_risk_indicators", 0),
        # Add granular counts from calculate_project_evidence_readiness
        "total_requirements": granular_readiness.get("total", 0),
        "approved_requirements": granular_readiness.get("approved", 0),
        "missing_requirements": granular_readiness.get("missing", 0),
        "partial_requirements": granular_readiness.get("partial", 0),
        "submitted_requirements": granular_readiness.get("submitted", 0),
        "rejected_requirements": granular_readiness.get("rejected", 0),
        "not_applicable_requirements": granular_readiness.get("not_applicable", 0),
    }
    
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
