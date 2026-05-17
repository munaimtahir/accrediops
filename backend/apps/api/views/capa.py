from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from apps.indicators.models import ProjectEvidenceRequirement, ProjectIndicator
from apps.projects.models import AccreditationProject
from apps.indicators.models.capa import Gap, CAPA
from apps.indicators import capa_services
from apps.workflow.permissions import ensure_project_reviewer_access
from apps.api.responses import success_response
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

    def list(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_queryset(), many=True).data)

class ProjectCAPAListView(generics.ListAPIView):
    serializer_class = CAPASerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(AccreditationProject, pk=self.kwargs["project_id"])
        ensure_project_reviewer_access(self.request.user, project)
        queryset = (
            CAPA.objects.filter(project=project)
            .select_related(
                "gap",
                "project_indicator__indicator",
                "project_evidence_requirement__evidence_requirement",
                "responsible_person",
            )
        )
        params = self.request.query_params

        if params.get("status"):
            queryset = queryset.filter(status=params["status"])
        if params.get("status__in"):
            queryset = queryset.filter(status__in=[part.strip() for part in params["status__in"].split(",") if part.strip()])
        if params.get("responsible_person"):
            if params["responsible_person"] == "me":
                queryset = queryset.filter(responsible_person_id=self.request.user.id)
            else:
                queryset = queryset.filter(responsible_person_id=params["responsible_person"])
        if params.get("overdue") == "true":
            queryset = queryset.filter(
                due_date__lt=timezone.localdate(),
                status__in=["OPEN", "IN_PROGRESS", "SUBMITTED_FOR_REVIEW", "REJECTED"],
            )
        if params.get("high_risk") == "true":
            queryset = queryset.filter(gap__severity__in=["HIGH", "CRITICAL"])
        if params.get("export_blocker") == "true":
            queryset = queryset.filter(
                Q(gap__severity__in=["HIGH", "CRITICAL"]) | Q(project_evidence_requirement__evidence_requirement__mandatory=True)
            )
        if params.get("severity"):
            queryset = queryset.filter(gap__severity=params["severity"])
        if params.get("indicator_id"):
            queryset = queryset.filter(project_indicator_id=params["indicator_id"])
        if params.get("requirement_id"):
            queryset = queryset.filter(project_evidence_requirement_id=params["requirement_id"])
        if params.get("gap_source"):
            queryset = queryset.filter(gap__source=params["gap_source"])
        if params.get("closed") == "true":
            queryset = queryset.filter(status="CLOSED")
        if params.get("search"):
            search = params["search"]
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(gap__title__icontains=search)
                | Q(project_indicator__indicator__code__icontains=search)
                | Q(project_evidence_requirement__evidence_requirement__title__icontains=search)
                | Q(responsible_person__username__icontains=search)
            )
        return queryset

    def list(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_queryset(), many=True).data)

class ProjectCAPASummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        ensure_project_reviewer_access(self.request.user, project)
        summary = capa_services.calculate_project_capa_summary(project)
        summary["assigned_to_me_count"] = CAPA.objects.filter(
            project=project,
            responsible_person=request.user,
            status__in=["OPEN", "IN_PROGRESS", "SUBMITTED_FOR_REVIEW", "REJECTED"],
        ).count()
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

    def list(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_queryset(), many=True).data)

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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(serializer.data, response_status=status.HTTP_201_CREATED)

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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(serializer.data, response_status=status.HTTP_201_CREATED)

class CAPADetailView(generics.RetrieveUpdateAPIView):
    queryset = CAPA.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        ensure_project_reviewer_access(self.request.user, obj.project)
        return obj

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CAPAUpdateSerializer
        return CAPASerializer

    def retrieve(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        capa_services.update_capa(actor=request.user, capa=instance, **serializer.validated_data)
        return success_response(CAPASerializer(instance).data)

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
            
        return success_response(CAPASerializer(capa).data)
