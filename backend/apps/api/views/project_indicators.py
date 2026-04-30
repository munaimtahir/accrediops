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
from apps.workflow.permissions import (
    ExplicitAuthenticatedPermission,
    ensure_admin_access,
    ensure_admin_or_lead_access,
    ensure_project_approver_access,
    ensure_project_owner_access,
)


class ProjectIndicatorDetailView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

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
                "request": request,
                "readiness_flags": validate_project_indicator_readiness(project_indicator),
                "audit_summary": recent_audit_summary(project_indicator),
            },
        )
        return success_response(serializer.data)


class ProjectIndicatorAssignView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        ensure_admin_or_lead_access(request.user)
        serializer = AssignProjectIndicatorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = assign_project_indicator(
            project_indicator=project_indicator,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorUpdateWorkingStateView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        ensure_project_owner_access(request.user, project_indicator)
        serializer = UpdateWorkingStateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = update_project_indicator_working_state(
            project_indicator=project_indicator,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorStartView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        ensure_project_owner_access(request.user, project_indicator)
        serializer = WorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = start_project_indicator(
            project_indicator=project_indicator,
            actor=request.user,
            reason=serializer.validated_data["reason"],
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorSendForReviewView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        ensure_project_owner_access(request.user, project_indicator)
        serializer = WorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = send_project_indicator_for_review(
            project_indicator=project_indicator,
            actor=request.user,
            reason=serializer.validated_data["reason"],
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorMarkMetView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        ensure_project_approver_access(request.user, project_indicator)
        serializer = WorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = mark_project_indicator_met(
            project_indicator=project_indicator,
            actor=request.user,
            reason=serializer.validated_data["reason"],
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)


class ProjectIndicatorReopenView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, pk):
        project_indicator = get_object_or_404(ProjectIndicator, pk=pk)
        ensure_admin_access(request.user)
        serializer = ReopenWorkflowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project_indicator = reopen_project_indicator(
            project_indicator=project_indicator,
            actor=request.user,
            reason=serializer.validated_data["reason"],
        )
        return success_response(ProjectIndicatorSerializer(project_indicator).data)

class ProjectIndicatorsForProjectListView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def get(self, request, project_id):
        project_indicators = ProjectIndicator.objects.filter(project_id=project_id).select_related(
            "indicator",
            "indicator__area",
            "indicator__standard"
        )
        return success_response(ProjectIndicatorSerializer(project_indicators, many=True).data)
