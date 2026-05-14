from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.indicators.models import ProjectEvidenceRequirement, ProjectIndicator
from apps.indicators.services import update_project_evidence_requirement
from ..serializers.project_evidence_requirements import ProjectEvidenceRequirementSerializer, ProjectEvidenceRequirementUpdateSerializer
from apps.workflow.permissions import ensure_project_owner_access, ensure_project_approver_access, ensure_project_reviewer_access


class ProjectEvidenceRequirementListView(generics.ListAPIView):
    serializer_class = ProjectEvidenceRequirementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_indicator_id = self.kwargs.get("project_indicator_id")
        project_indicator = get_object_or_404(ProjectIndicator, pk=project_indicator_id)
        ensure_project_reviewer_access(self.request.user, project_indicator)
        return ProjectEvidenceRequirement.objects.filter(project_indicator=project_indicator)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})

class ProjectEvidenceRequirementDetailView(generics.RetrieveUpdateAPIView):
    queryset = ProjectEvidenceRequirement.objects.all()
    serializer_class = ProjectEvidenceRequirementSerializer # Default for GET
    update_serializer_class = ProjectEvidenceRequirementUpdateSerializer # For PATCH

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return self.update_serializer_class
        return self.serializer_class

    def perform_update(self, serializer):
        project_evidence_requirement = self.get_object()
        project_indicator = project_evidence_requirement.project_indicator

        # Perform permission check before updating based on status change
        status_to_update = serializer.validated_data.get('status')
        if status_to_update == 'APPROVED':
            ensure_project_approver_access(self.request.user, project_indicator)
        else:
            ensure_project_owner_access(self.request.user, project_indicator)

        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        # Re-serialize with the detail serializer to get all fields
        final_serializer = ProjectEvidenceRequirementSerializer(instance)
        return Response({"success": True, "data": final_serializer.data})

    def get_permissions(self):
        return [IsAuthenticated()]
