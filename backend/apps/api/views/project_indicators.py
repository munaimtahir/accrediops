from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.api.serializers.project_indicators import (
    AssignProjectIndicatorSerializer,
    ProjectIndicatorDetailSerializer,
    ProjectIndicatorSerializer,
    ReopenWorkflowActionSerializer,
    UpdateWorkingStateSerializer,
    WorkflowActionSerializer,
)
from apps.indicators.models import ProjectIndicator
from apps.indicators.services import (
    assign_project_indicator,
    mark_project_indicator_met,
    recent_audit_summary,
    reopen_project_indicator,
    send_project_indicator_for_review,
    start_project_indicator,
    update_project_indicator_working_state,
    validate_project_indicator_readiness,
)


class ProjectIndicatorDetailView(APIView):
    def get(self, request, pk):
        project_indicator = get_object_or_404(
            ProjectIndicator.objects.select_related(
                "project",
                "owner",
                "reviewer",
                "approver",
                "last_updated_by",
                "indicator",
                "indicator__framework",
                "indicator__area",
                "indicator__standard",
            ).prefetch_related(
                "evidence_items",
                "comments__created_by",
                "status_history__actor",
                "generated_outputs",
                "recurring_requirement__instances",
            ),
            pk=pk,
        )
        serializer = ProjectIndicatorDetailSerializer(
            project_indicator,
            context={
                "readiness_flags": validate_project_indicator_readiness(project_indicator),
                "audit_summary": recent_audit_summary(project_indicator),
            },
        )
        return success_response(serializer.data)


class ProjectIndicatorAssignView(APIView):
    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        serializer = AssignProjectIndicatorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = assign_project_indicator(
            project_indicator=project_indicator,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorUpdateWorkingStateView(APIView):
    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        serializer = UpdateWorkingStateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = update_project_indicator_working_state(
            project_indicator=project_indicator,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorStartView(APIView):
    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        serializer = WorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = start_project_indicator(
            project_indicator=project_indicator,
            actor=request.user,
            reason=serializer.validated_data["reason"],
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorSendForReviewView(APIView):
    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        serializer = WorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = send_project_indicator_for_review(
            project_indicator=project_indicator,
            actor=request.user,
            reason=serializer.validated_data["reason"],
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorMarkMetView(APIView):
    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        serializer = WorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = mark_project_indicator_met(
            project_indicator=project_indicator,
            actor=request.user,
            reason=serializer.validated_data["reason"],
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorReopenView(APIView):
    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        serializer = ReopenWorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = reopen_project_indicator(
            project_indicator=project_indicator,
            actor=request.user,
            reason=serializer.validated_data["reason"],
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)
