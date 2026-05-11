import sys

filename = "backend/apps/indicators/services.py"

with open(filename, "r") as f:
    content = f.read()

import re

new_func = """def validate_project_indicator_readiness(project_indicator: ProjectIndicator) -> dict:
    today = timezone.localdate()
    current_evidence = project_indicator.evidence_items.filter(is_current=True)
    approved_current = current_evidence.filter(approval_status="APPROVED")
    rejected_current = current_evidence.filter(approval_status="REJECTED")

    # Compute from ProjectEvidenceRequirement
    requirements = project_indicator.evidence_requirements.all()
    total_reqs = requirements.count()
    mandatory_reqs = requirements.filter(evidence_requirement__mandatory=True)

    approved_reqs = requirements.filter(status="APPROVED").count()
    rejected_reqs = requirements.filter(status="REJECTED").count()
    missing_mandatory = mandatory_reqs.exclude(status="APPROVED").count()

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
        "missing_evidence_count": max(
            project_indicator.indicator.minimum_required_evidence_count - approved_current.count(),
            0,
        ),
        "all_current_evidence_approved": current_evidence.exists() and not current_evidence.exclude(approval_status="APPROVED").exists(),
        "no_rejected_current_evidence": not rejected_current.exists(),
        "overdue_recurring_instances_count": overdue_recurring,
        "overdue_recurring_count": overdue_recurring,
        "recurring_requirements_clear": overdue_recurring == 0,
        "is_ready_for_review": bool(project_indicator.notes.strip()) or project_indicator.evidence_items.exists(),
        "is_blocked": project_indicator.current_status == ProjectIndicatorStatusChoices.BLOCKED,
        "rejected_evidence_count": rejected_current.count(),
        "total_requirements": total_reqs,
        "mandatory_requirements": mandatory_reqs.count(),
        "approved_requirements_count": approved_reqs,
        "rejected_requirements_count": rejected_reqs,
        "missing_mandatory_requirements_count": missing_mandatory,
    }

    # Ready for met takes into account mandatory requirements if any exist
    base_readiness = [
        readiness["has_minimum_required_evidence"],
        readiness["all_current_evidence_approved"],
        readiness["no_rejected_current_evidence"],
        readiness["recurring_requirements_clear"],
    ]
    if total_reqs > 0:
        base_readiness.append(missing_mandatory == 0)

    readiness["ready_for_met"] = all(base_readiness)
    readiness["risk"] = classify_indicator_risk(project_indicator, today=today)
    return readiness"""

# Regex replacement
content = re.sub(
    r"def validate_project_indicator_readiness\(project_indicator: ProjectIndicator\) -> dict:.*?return readiness",
    new_func,
    content,
    flags=re.DOTALL
)

with open(filename, "w") as f:
    f.write(content)
