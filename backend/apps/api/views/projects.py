from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Count, Q

from apps.api.pagination import EnvelopePagination
from apps.api.responses import success_response
from apps.api.serializers.projects import (
    AreasProgressSerializer,
    CloneProjectSerializer,
    InitializeProjectSerializer,
    ProjectDetailSerializer,
    ProjectSerializer,
    ProjectWriteSerializer,
    StandardsProgressSerializer,
)
from apps.indicators.services import areas_progress, standards_progress
from apps.projects.models import AccreditationProject
from apps.projects.services import clone_project, create_project, delete_project, initialize_project_from_framework, update_project
from apps.exports.services import build_print_bundle
from apps.exports.services_admin import project_readiness
from apps.workflow.permissions import ExplicitAuthenticatedPermission, ensure_admin_or_lead_access


class ProjectListCreateView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    pagination_class = EnvelopePagination
    permission_classes = [ExplicitAuthenticatedPermission]

    def get_queryset(self):
        return AccreditationProject.objects.select_related("framework", "created_by").order_by("-created_at")

    def post(self, request, *args, **kwargs):
        ensure_admin_or_lead_access(request.user)
        serializer = ProjectWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = create_project(actor=request.user, **serializer.validated_data)
        return success_response(ProjectDetailSerializer(project).data, response_status=status.HTTP_201_CREATED)


class ProjectRetrieveUpdateView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def get(self, request, pk):
        project = get_object_or_404(AccreditationProject.objects.select_related("framework", "created_by"), pk=pk)
        return success_response(ProjectDetailSerializer(project).data)

    def patch(self, request, pk):
        ensure_admin_or_lead_access(request.user)
        project = get_object_or_404(AccreditationProject, pk=pk)
        serializer = ProjectWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        project = update_project(project=project, actor=request.user, **serializer.validated_data)
        return success_response(ProjectDetailSerializer(project).data)

    def delete(self, request, pk):
        ensure_admin_or_lead_access(request.user)
        project = get_object_or_404(AccreditationProject, pk=pk)
        delete_project(project=project, actor=request.user)
        return success_response({"id": pk, "deleted": True})


class ProjectInitializeFromFrameworkView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        ensure_admin_or_lead_access(request.user)
        serializer = InitializeProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = initialize_project_from_framework(project=project, actor=request.user, **serializer.validated_data)
        return success_response(result)


class ProjectCloneView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, project_id):
        source_project = get_object_or_404(AccreditationProject, pk=project_id)
        ensure_admin_or_lead_access(request.user)
        serializer = CloneProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = clone_project(
            source_project=source_project,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(ProjectDetailSerializer(project).data, response_status=status.HTTP_201_CREATED)


class StandardsProgressView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        data = StandardsProgressSerializer(standards_progress(project), many=True).data
        return success_response(data)


class AreasProgressView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        data = AreasProgressSerializer(areas_progress(project), many=True).data
        return success_response(data)


class ProjectInspectionView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        bundle = build_print_bundle(project)
        filtered_sections = []
        for section in bundle["sections"]:
            standards = []
            for standard in section["standards"]:
                indicators = [item for item in standard["indicators"] if item["status"] == "MET"]
                if indicators:
                    standards.append({"name": standard["name"], "indicators": indicators})
            if standards:
                filtered_sections.append({"name": section["name"], "standards": standards})
        return success_response({"sections": filtered_sections})


class PreInspectionCheckView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        readiness = project_readiness(project)
        missing_evidence = []
        unapproved_items = []
        overdue_recurring = []

        project_indicators = project.project_indicators.select_related("indicator").annotate(
            approved_count=Count(
                "evidence_items",
                filter=Q(evidence_items__is_current=True, evidence_items__approval_status="APPROVED"),
                distinct=True
            ),
            non_approved_count=Count(
                "evidence_items",
                filter=Q(evidence_items__is_current=True) & ~Q(evidence_items__approval_status="APPROVED"),
                distinct=True
            ),
            overdue_count=Count(
                "recurring_requirement__instances",
                filter=Q(
                    recurring_requirement__instances__status__in=["PENDING", "SUBMITTED", "MISSED"],
                    recurring_requirement__instances__due_date__lt=timezone.localdate(),
                ),
                distinct=True
            )
        )

        for item in project_indicators:
            if item.approved_count < item.indicator.minimum_required_evidence_count:
                missing_evidence.append(
                    {
                        "project_indicator_id": item.id,
                        "indicator_code": item.indicator.code,
                        "missing_count": item.indicator.minimum_required_evidence_count - item.approved_count,
                    }
                )

            if item.non_approved_count:
                unapproved_items.append(
                    {
                        "project_indicator_id": item.id,
                        "indicator_code": item.indicator.code,
                        "unapproved_count": item.non_approved_count,
                    }
                )

            if item.overdue_count:
                overdue_recurring.append(
                    {
                        "project_indicator_id": item.id,
                        "indicator_code": item.indicator.code,
                        "overdue_count": item.overdue_count,
                    }
                )

        return success_response(
            {
                "missing_evidence": missing_evidence,
                "unapproved_items": unapproved_items,
                "overdue_recurring": overdue_recurring,
                "high_risk_indicators": readiness["high_risk_indicators"],
            }
        )
