from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.indicators.models import ProjectEvidenceRequirement, ProjectIndicator
from apps.projects.models import AccreditationProject
from apps.indicators.models.capa import Gap, CAPA
from apps.indicators import capa_services
from apps.workflow.permissions import ensure_project_reviewer_access
from ..serializers.capa import (
    GapSerializer,
    GapCreateSerializer,
    CAPASerializer,
    CAPACreateSerializer,
    CAPAUpdateSerializer,
    CAPAActionSerializer,
    CAPASummarySerializer,
)

class ProjectGapListView(generics.ListAPIView):
    serializer_class = GapSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(AccreditationProject, pk=self.kwargs["project_id"])
        ensure_project_reviewer_access(self.request.user, project)
        return Gap.objects.filter(project=project)

class ProjectCAPAListView(generics.ListAPIView):
    serializer_class = CAPASerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(AccreditationProject, pk=self.kwargs["project_id"])
        ensure_project_reviewer_access(self.request.user, project)
        return CAPA.objects.filter(project=project)

class ProjectCAPASummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        ensure_project_reviewer_access(self.request.user, project)
        summary = capa_services.calculate_project_capa_summary(project)
        serializer = CAPASummarySerializer(summary)
        return Response({"success": True, "data": serializer.data})

class RequirementGapListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GapCreateSerializer
        return GapSerializer

    def get_queryset(self):
        req = get_object_or_404(ProjectEvidenceRequirement, pk=self.kwargs["requirement_id"])
        ensure_project_reviewer_access(self.request.user, req.project_indicator)
        return Gap.objects.filter(project_evidence_requirement=req)

    def perform_create(self, serializer):
        req = get_object_or_404(ProjectEvidenceRequirement, pk=self.kwargs["requirement_id"])
        gap = capa_services.create_gap_from_project_evidence_requirement(
            actor=self.request.user,
            project_evidence_requirement=req,
            title=serializer.validated_data["title"],
            description=serializer.validated_data["description"],
            severity=serializer.validated_data.get("severity", "MEDIUM"),
        )
        serializer.instance = gap

class GapCAPACreateView(generics.CreateAPIView):
    serializer_class = CAPACreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        gap = get_object_or_404(Gap, pk=self.kwargs["gap_id"])
        capa = capa_services.create_capa_from_gap(
            actor=self.request.user,
            gap=gap,
            title=serializer.validated_data["title"],
            root_cause=serializer.validated_data.get("root_cause", ""),
            corrective_action=serializer.validated_data.get("corrective_action", ""),
            preventive_action=serializer.validated_data.get("preventive_action", ""),
            responsible_person=serializer.validated_data.get("responsible_person"),
            due_date=serializer.validated_data.get("due_date"),
        )
        serializer.instance = capa

class CAPADetailView(generics.RetrieveUpdateAPIView):
    queryset = CAPA.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CAPAUpdateSerializer
        return CAPASerializer

    def perform_update(self, serializer):
        capa_services.update_capa(
            actor=self.request.user,
            capa=self.get_object(),
            **serializer.validated_data
        )

class CAPAActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        capa = get_object_or_404(CAPA, pk=pk)
        serializer = CAPAActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        
        if action == "SUBMIT":
            capa = capa_services.submit_capa_for_review(actor=request.user, capa=capa)
        elif action == "CLOSE":
            from apps.evidence.models import EvidenceItem
            closure_evidence_id = serializer.validated_data.get("closure_evidence_id")
            closure_evidence = None
            if closure_evidence_id:
                closure_evidence = get_object_or_404(EvidenceItem, pk=closure_evidence_id)
            capa = capa_services.close_capa(
                actor=request.user, 
                capa=capa, 
                closure_notes=serializer.validated_data.get("closure_notes", ""),
                closure_evidence=closure_evidence
            )
        elif action == "REJECT":
            capa = capa_services.reject_capa(
                actor=request.user,
                capa=capa,
                rejection_reason=serializer.validated_data.get("rejection_reason", "")
            )
            
        return Response({"success": True, "data": CAPASerializer(capa).data})
