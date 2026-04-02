from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.api.serializers.recurring import (
    ApproveRecurringInstanceSerializer,
    RecurringEvidenceInstanceSerializer,
    SubmitRecurringInstanceSerializer,
)
from apps.recurring.models import RecurringEvidenceInstance
from apps.recurring.services import approve_recurring_instance, submit_recurring_instance


class RecurringQueueView(ListAPIView):
    serializer_class = RecurringEvidenceInstanceSerializer

    def get_queryset(self):
        params = self.request.query_params
        today = timezone.localdate()
        queryset = RecurringEvidenceInstance.objects.select_related(
            "recurring_requirement",
            "recurring_requirement__project_indicator",
            "recurring_requirement__project_indicator__project",
            "recurring_requirement__project_indicator__indicator",
            "linked_evidence_item",
        ).order_by("due_date")
        if params.get("project_id"):
            queryset = queryset.filter(recurring_requirement__project_indicator__project_id=params["project_id"])
        if params.get("frequency"):
            queryset = queryset.filter(recurring_requirement__frequency=params["frequency"])
        if params.get("owner_id"):
            queryset = queryset.filter(recurring_requirement__project_indicator__owner_id=params["owner_id"])
        if params.get("due_today") == "true":
            queryset = queryset.filter(due_date=today)
        if params.get("overdue") == "true":
            queryset = queryset.filter(due_date__lt=today, status__in=["PENDING", "SUBMITTED", "MISSED"])
        return queryset

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(serializer.data)


class RecurringInstanceSubmitView(APIView):
    def post(self, request, pk):
        recurring_instance = get_object_or_404(RecurringEvidenceInstance, pk=pk)
        serializer = SubmitRecurringInstanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recurring_instance = submit_recurring_instance(
            recurring_instance=recurring_instance,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(RecurringEvidenceInstanceSerializer(recurring_instance).data)


class RecurringInstanceApproveView(APIView):
    def post(self, request, pk):
        recurring_instance = get_object_or_404(RecurringEvidenceInstance, pk=pk)
        serializer = ApproveRecurringInstanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recurring_instance = approve_recurring_instance(
            recurring_instance=recurring_instance,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(RecurringEvidenceInstanceSerializer(recurring_instance).data)
