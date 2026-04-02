from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.generics import ListAPIView

from apps.api.pagination import EnvelopePagination
from apps.api.serializers.project_indicators import DashboardWorklistSerializer
from apps.indicators.models import ProjectIndicator


class DashboardWorklistView(ListAPIView):
    serializer_class = DashboardWorklistSerializer
    pagination_class = EnvelopePagination

    def get_queryset(self):
        params = self.request.query_params
        today = timezone.localdate()
        queryset = (
            ProjectIndicator.objects.select_related(
                "project",
                "owner",
                "reviewer",
                "approver",
                "indicator",
                "indicator__area",
                "indicator__standard",
            )
            .annotate(
                approved_evidence_count=Count(
                    "evidence_items",
                    filter=Q(evidence_items__is_current=True, evidence_items__approval_status="APPROVED"),
                    distinct=True,
                ),
                total_evidence_count=Count(
                    "evidence_items",
                    filter=Q(evidence_items__is_current=True),
                    distinct=True,
                ),
                pending_recurring_instances_count=Count(
                    "recurring_requirement__instances",
                    filter=Q(recurring_requirement__instances__status__in=["PENDING", "SUBMITTED", "MISSED"]),
                    distinct=True,
                ),
                overdue_recurring_instances_count=Count(
                    "recurring_requirement__instances",
                    filter=Q(
                        recurring_requirement__instances__status__in=["PENDING", "SUBMITTED", "MISSED"],
                        recurring_requirement__instances__due_date__lt=today,
                    ),
                    distinct=True,
                ),
            )
            .order_by("project__name", "indicator__area__sort_order", "indicator__standard__sort_order", "indicator__sort_order")
        )
        if params.get("project_id"):
            queryset = queryset.filter(project_id=params["project_id"])
        if params.get("area_id"):
            queryset = queryset.filter(indicator__area_id=params["area_id"])
        if params.get("standard_id"):
            queryset = queryset.filter(indicator__standard_id=params["standard_id"])
        if params.get("status"):
            queryset = queryset.filter(current_status=params["status"])
        if params.get("priority"):
            queryset = queryset.filter(priority=params["priority"])
        if params.get("owner_id"):
            queryset = queryset.filter(owner_id=params["owner_id"])
        if params.get("reviewer_id"):
            queryset = queryset.filter(reviewer_id=params["reviewer_id"])
        if params.get("approver_id"):
            queryset = queryset.filter(approver_id=params["approver_id"])
        if params.get("recurring") in {"true", "false"}:
            queryset = queryset.filter(indicator__is_recurring=params["recurring"] == "true")
        if params.get("due_today") == "true":
            queryset = queryset.filter(due_date=today)
        if params.get("overdue") == "true":
            queryset = queryset.filter(due_date__lt=today)
        if params.get("search"):
            search = params["search"]
            queryset = queryset.filter(
                Q(project__name__icontains=search)
                | Q(indicator__code__icontains=search)
                | Q(indicator__text__icontains=search)
                | Q(indicator__area__name__icontains=search)
                | Q(indicator__standard__name__icontains=search)
            )
        if params.get("evidence_approval_status"):
            queryset = queryset.filter(
                evidence_items__is_current=True,
                evidence_items__approval_status=params["evidence_approval_status"],
            )
        return queryset.distinct()
