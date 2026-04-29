from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.api.serializers.evidence import (
    CreateEvidenceSerializer,
    EvidenceItemSerializer,
    EvidenceReviewSerializer,
    UpdateEvidenceSerializer,
)
from apps.evidence.models import EvidenceItem
from apps.evidence.services import create_evidence_item, review_evidence_item, update_evidence_item
from apps.indicators.models import ProjectIndicator
from apps.workflow.permissions import ExplicitAuthenticatedPermission, ensure_project_owner_access, ensure_project_reviewer_access


class ProjectIndicatorEvidenceListView(ListAPIView):
    serializer_class = EvidenceItemSerializer
    permission_classes = [ExplicitAuthenticatedPermission]

    def get_queryset(self):
        project_indicator = get_object_or_404(ProjectIndicator, pk=self.kwargs["pk"])
        return EvidenceItem.objects.filter(project_indicator=project_indicator).select_related("uploaded_by", "reviewed_by")

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(serializer.data)


class EvidenceCreateView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request):
        serializer = CreateEvidenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ensure_project_owner_access(request.user, serializer.validated_data["project_indicator"])
        evidence_item = create_evidence_item(actor=request.user, **serializer.validated_data)
        return success_response(EvidenceItemSerializer(evidence_item).data, response_status=201)


class EvidenceUpdateView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, pk):
        evidence_item = get_object_or_404(EvidenceItem, pk=pk)
        ensure_project_owner_access(request.user, evidence_item.project_indicator)
        serializer = UpdateEvidenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evidence_item = update_evidence_item(
            evidence_item=evidence_item,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(EvidenceItemSerializer(evidence_item).data)


class EvidenceReviewView(APIView):
    permission_classes = [ExplicitAuthenticatedPermission]

    def post(self, request, pk):
        evidence_item = get_object_or_404(EvidenceItem, pk=pk)
        ensure_project_reviewer_access(request.user, evidence_item.project_indicator)
        serializer = EvidenceReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evidence_item = review_evidence_item(
            evidence_item=evidence_item,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(EvidenceItemSerializer(evidence_item).data)
