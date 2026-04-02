from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView

from apps.api.pagination import EnvelopePagination
from apps.api.responses import success_response
from apps.api.serializers.projects import (
    AreasProgressSerializer,
    InitializeProjectSerializer,
    ProjectDetailSerializer,
    ProjectSerializer,
    ProjectWriteSerializer,
    StandardsProgressSerializer,
)
from apps.indicators.services import areas_progress, standards_progress
from apps.projects.models import AccreditationProject
from apps.projects.services import create_project, initialize_project_from_framework, update_project


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
