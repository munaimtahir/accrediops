from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView
from django.utils import timezone

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
from apps.projects.services import clone_project, create_project, initialize_project_from_framework, update_project
from apps.exports.services import build_print_bundle
from apps.exports.services_admin import project_readiness


class ProjectListCreateView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    pagination_class = EnvelopePagination

    def get_queryset(self):
        return AccreditationProject.objects.select_related("framework", "created_by").order_by("-created_at")

    def post(self, request, *args, **kwargs):
        serializer = ProjectWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = create_project(actor=request.user, **serializer.validated_data)
        return success_response(ProjectDetailSerializer(project).data, response_status=status.HTTP_201_CREATED)


class ProjectRetrieveUpdateView(APIView):
    def get(self, request, pk):
        project = get_object_or_404(AccreditationProject.objects.select_related("framework", "created_by"), pk=pk)
        return success_response(ProjectDetailSerializer(project).data)

    def patch(self, request, pk):
        project = get_object_or_404(AccreditationProject, pk=pk)
        serializer = ProjectWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        project = update_project(project=project, actor=request.user, **serializer.validated_data)
        return success_response(ProjectDetailSerializer(project).data)


class ProjectInitializeFromFrameworkView(APIView):
    def post(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        serializer = InitializeProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = initialize_project_from_framework(project=project, actor=request.user, **serializer.validated_data)
        return success_response(result)


class ProjectCloneView(APIView):
    def post(self, request, project_id):
        source_project = get_object_or_404(AccreditationProject, pk=project_id)
        serializer = CloneProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = clone_project(
            source_project=source_project,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(ProjectDetailSerializer(project).data, response_status=status.HTTP_201_CREATED)


class StandardsProgressView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        data = StandardsProgressSerializer(standards_progress(project), many=True).data
        return success_response(data)


class AreasProgressView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        data = AreasProgressSerializer(areas_progress(project), many=True).data
        return success_response(data)


class ProjectInspectionView(APIView):
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
    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        readiness = project_readiness(project)
        missing_evidence = []
        unapproved_items = []
        overdue_recurring = []
        for item in project.project_indicators.select_related("indicator").prefetch_related("evidence_items"):
            approved_count = item.evidence_items.filter(is_current=True, approval_status="APPROVED").count()
            if approved_count < item.indicator.minimum_required_evidence_count:
                missing_evidence.append(
                    {
                        "project_indicator_id": item.id,
                        "indicator_code": item.indicator.code,
                        "missing_count": item.indicator.minimum_required_evidence_count - approved_count,
                    }
                )
            non_approved = item.evidence_items.filter(is_current=True).exclude(approval_status="APPROVED").count()
            if non_approved:
                unapproved_items.append(
                    {
                        "project_indicator_id": item.id,
                        "indicator_code": item.indicator.code,
                        "unapproved_count": non_approved,
                    }
                )
            if hasattr(item, "recurring_requirement"):
                overdue = item.recurring_requirement.instances.filter(
                    status__in=["PENDING", "SUBMITTED", "MISSED"],
                    due_date__lt=timezone.localdate(),
                ).count()
                if overdue:
                    overdue_recurring.append(
                        {
                            "project_indicator_id": item.id,
                            "indicator_code": item.indicator.code,
                            "overdue_count": overdue,
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
