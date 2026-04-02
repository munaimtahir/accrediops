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


class ProjectIndicatorEvidenceListView(ListAPIView):
    serializer_class = EvidenceItemSerializer

    def get_queryset(self):
        project_indicator = get_object_or_404(ProjectIndicator, pk=self.kwargs["pk"])
        return EvidenceItem.objects.filter(project_indicator=project_indicator).select_related("uploaded_by", "reviewed_by")

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(serializer.data)


class EvidenceCreateView(APIView):
    def post(self, request):
        serializer = CreateEvidenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evidence_item = create_evidence_item(actor=request.user, **serializer.validated_data)
        return success_response(EvidenceItemSerializer(evidence_item).data, response_status=201)


class EvidenceUpdateView(APIView):
    def post(self, request, pk):
        evidence_item = get_object_or_404(EvidenceItem, pk=pk)
        serializer = UpdateEvidenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evidence_item = update_evidence_item(
            evidence_item=evidence_item,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(EvidenceItemSerializer(evidence_item).data)


class EvidenceReviewView(APIView):
    def post(self, request, pk):
        evidence_item = get_object_or_404(EvidenceItem, pk=pk)
        serializer = EvidenceReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evidence_item = review_evidence_item(
            evidence_item=evidence_item,
            actor=request.user,
            **serializer.validated_data,
        )
        return success_response(EvidenceItemSerializer(evidence_item).data)
