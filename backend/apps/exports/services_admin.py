from django.db.models import Count, Q
from django.utils import timezone

from apps.audit.models import AuditEvent
from apps.indicators.models import ProjectIndicator
from apps.projects.models import AccreditationProject
from apps.recurring.models import RecurringEvidenceInstance


def admin_dashboard_summary() -> dict:
    today = timezone.localdate()
    return {
        "total_projects": AccreditationProject.objects.count(),
        "active_projects": AccreditationProject.objects.filter(status="ACTIVE").count(),
        "overdue_indicators": ProjectIndicator.objects.filter(due_date__lt=today, is_met=False).count(),
        "overdue_recurring_items": RecurringEvidenceInstance.objects.filter(
            due_date__lt=today,
            status__in=["PENDING", "SUBMITTED", "MISSED"],
        ).count(),
        "indicators_under_review": ProjectIndicator.objects.filter(current_status="UNDER_REVIEW").count(),
        "recent_audit_events": list(
            AuditEvent.objects.select_related("actor").all()[:20].values(
                "id",
                "event_type",
                "object_type",
                "object_id",
                "reason",
                "timestamp",
                "actor__id",
                "actor__username",
            )
        ),
    }


def project_readiness(project: AccreditationProject) -> dict:
    indicators = project.project_indicators.all()
    total = indicators.count() or 1
    met = indicators.filter(is_met=True).count()
    in_progress = indicators.filter(current_status="IN_PROGRESS").count()
    blocked = indicators.filter(current_status="BLOCKED").count()
    recurring_instances = RecurringEvidenceInstance.objects.filter(
        recurring_requirement__project_indicator__project=project
    )
    recurring_total = recurring_instances.count() or 1
    recurring_approved = recurring_instances.filter(status="APPROVED").count()
    recurring_compliance_score = round((recurring_approved / recurring_total) * 100, 2)

    high_risk = []
    today = timezone.localdate()
    for item in indicators.select_related("indicator").prefetch_related("evidence_items"):
        current_evidence = item.evidence_items.filter(is_current=True)
        rejected_count = current_evidence.filter(approval_status="REJECTED").count()
        overdue_recurring_count = (
            item.recurring_requirement.instances.filter(
                due_date__lt=today,
                status__in=["PENDING", "SUBMITTED", "MISSED"],
            ).count()
            if hasattr(item, "recurring_requirement")
            else 0
        )
        near_due = bool(item.due_date and (item.due_date - today).days <= 3 and item.due_date >= today)
        no_evidence_near_due = near_due and not current_evidence.exists()
        if rejected_count > 0 or overdue_recurring_count > 0 or no_evidence_near_due:
            high_risk.append(
                {
                    "project_indicator_id": item.id,
                    "indicator_code": item.indicator.code,
                    "rejected_evidence_count": rejected_count,
                    "overdue_recurring_count": overdue_recurring_count,
                    "no_evidence_near_due": no_evidence_near_due,
                }
            )

    overall_score = round(((met / total) * 70) + ((recurring_compliance_score / 100) * 30), 2)
    return {
        "overall_score": overall_score,
        "percent_met": round((met / total) * 100, 2),
        "percent_in_progress": round((in_progress / total) * 100, 2),
        "percent_blocked": round((blocked / total) * 100, 2),
        "recurring_compliance_score": recurring_compliance_score,
        "high_risk_indicators": high_risk,
    }
