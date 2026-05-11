import sys
import re

filename = "backend/apps/projects/services.py"

with open(filename, "r") as f:
    content = f.read()

new_func = """def initialize_project_from_framework(
    *,
    project: AccreditationProject,
    actor,
    create_initial_instances: bool = True,
) -> dict:
    from apps.recurring.services import ensure_recurring_requirement_for_project_indicator, generate_recurring_instances
    from apps.indicators.models import ProjectEvidenceRequirement, EvidenceRequirement

    ensure_admin_or_lead_access(actor)
    indicators = Indicator.objects.filter(
        framework=project.framework,
        is_active=True,
    ).select_related("area", "standard")
    created_count = 0
    recurring_count = 0
    requirements_count = 0
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
            # Generate project level fulfillment
            evidence_requirements = indicator.evidence_requirements.filter(is_active=True)
            for er in evidence_requirements:
                ProjectEvidenceRequirement.objects.get_or_create(
                    project=project,
                    project_indicator=project_indicator,
                    framework_indicator=indicator,
                    evidence_requirement=er,
                )
                requirements_count += 1

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
            "created_evidence_requirements": requirements_count,
        },
    )
    return {
        "created_project_indicators": created_count,
        "recurring_requirements_processed": recurring_count,
        "created_evidence_requirements": requirements_count,
    }"""

content = re.sub(
    r"def initialize_project_from_framework\(.*?\n    return \{\n        \"created_project_indicators\": created_count,\n        \"recurring_requirements_processed\": recurring_count,\n    \}",
    new_func,
    content,
    flags=re.DOTALL
)

with open(filename, "w") as f:
    f.write(content)
