from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from rest_framework import generics
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.api.responses import success_response
from apps.api.serializers.admin import (
    AuditEventAdminSerializer,
    ExportJobSerializer,
    ImportLogSerializer,
    MasterValueSerializer,
    UserAdminSerializer,
)
from apps.audit.models import AuditEvent
from apps.exports.models import ExportJob, ImportLog
from apps.exports.services import (
    create_export_job,
    export_validation_warnings,
    log_framework_import,
    validate_framework_import_rows,
)
from apps.exports.services_admin import admin_dashboard_summary, project_readiness
from apps.masters.models import MasterValue
from apps.masters.services import ensure_master_key
from apps.projects.models import AccreditationProject
from apps.workflow.permissions import ensure_admin_or_lead_access


class AdminDashboardView(APIView):
    def get(self, request):
        ensure_admin_or_lead_access(request.user)
        return success_response(admin_dashboard_summary())


class MasterValueListCreateView(APIView):
    def get(self, request, key):
        ensure_admin_or_lead_access(request.user)
        ensure_master_key(key)
        queryset = MasterValue.objects.filter(key=key).order_by("sort_order", "code")
        return success_response(MasterValueSerializer(queryset, many=True).data)

    def post(self, request, key):
        ensure_admin_or_lead_access(request.user)
        ensure_master_key(key)
        serializer = MasterValueSerializer(data={**request.data, "key": key})
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return success_response(MasterValueSerializer(item).data, response_status=201)


class MasterValueUpdateView(APIView):
    def patch(self, request, key, pk):
        ensure_admin_or_lead_access(request.user)
        ensure_master_key(key)
        item = get_object_or_404(MasterValue, pk=pk, key=key)
        serializer = MasterValueSerializer(item, data={**request.data, "key": key}, partial=True)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return success_response(MasterValueSerializer(item).data)


class AdminUsersView(generics.ListAPIView):
    serializer_class = UserAdminSerializer

    def get_queryset(self):
        ensure_admin_or_lead_access(self.request.user)
        return User.objects.select_related("department").order_by("username")

    def list(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_queryset(), many=True).data)


class AdminUserUpdateView(APIView):
    def patch(self, request, pk):
        ensure_admin_or_lead_access(request.user)
        user = get_object_or_404(User, pk=pk)
        serializer = UserAdminSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(UserAdminSerializer(user).data)


class AuditLogView(generics.ListAPIView):
    serializer_class = AuditEventAdminSerializer

    def get_queryset(self):
        ensure_admin_or_lead_access(self.request.user)
        params = self.request.query_params
        queryset = AuditEvent.objects.select_related("actor").order_by("-timestamp")
        if params.get("user"):
            queryset = queryset.filter(actor_id=params["user"])
        if params.get("event_type"):
            queryset = queryset.filter(event_type=params["event_type"])
        if params.get("object_type"):
            queryset = queryset.filter(object_type=params["object_type"])
        if params.get("start"):
            start = parse_datetime(params["start"])
            if start:
                queryset = queryset.filter(timestamp__gte=start)
        if params.get("end"):
            end = parse_datetime(params["end"])
            if end:
                queryset = queryset.filter(timestamp__lte=end)
        return queryset

    def list(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_queryset(), many=True).data)


class ReopenOverridesView(APIView):
    def get(self, request):
        ensure_admin_or_lead_access(request.user)
        queryset = AuditEvent.objects.select_related("actor").filter(
            event_type="project_indicator.status_changed",
            reason__isnull=False,
            reason__gt="",
        )
        rows = []
        for row in AuditEventAdminSerializer(queryset, many=True).data:
            before = row.get("before_json") or {}
            after = row.get("after_json") or {}
            if before.get("current_status") == "MET" and after.get("current_status") == "IN_PROGRESS":
                rows.append(row)
        return success_response(rows)


class ProjectReadinessView(APIView):
    def get(self, request, project_id):
        ensure_admin_or_lead_access(request.user)
        project = get_object_or_404(AccreditationProject, pk=project_id)
        return success_response(project_readiness(project))


class ExportHistoryView(APIView):
    def get(self, request, project_id):
        ensure_admin_or_lead_access(request.user)
        project = get_object_or_404(AccreditationProject, pk=project_id)
        queryset = ExportJob.objects.filter(project=project).order_by("-created_at")
        return success_response(ExportJobSerializer(queryset, many=True).data)


class ExportGenerateView(APIView):
    def post(self, request, project_id):
        ensure_admin_or_lead_access(request.user)
        project = get_object_or_404(AccreditationProject, pk=project_id)
        export_type = request.data.get("type", "print-bundle")
        parameters = request.data.get("parameters") or {}
        job = create_export_job(
            project=project,
            actor=request.user,
            export_type=export_type,
            parameters=parameters,
        )
        return success_response(ExportJobSerializer(job).data, response_status=201)


class FrameworkImportValidateView(APIView):
    def post(self, request):
        ensure_admin_or_lead_access(request.user)
        file_name = request.data.get("file_name", "framework-import.json")
        rows = request.data.get("rows") or []
        result = validate_framework_import_rows(rows)
        log = log_framework_import(
            file_name=file_name,
            rows_processed=result["rows_processed"],
            errors=result["errors"],
        )
        payload = result | {"log_id": log.id}
        return success_response(payload)


class ImportLogListView(APIView):
    def get(self, request):
        ensure_admin_or_lead_access(request.user)
        queryset = ImportLog.objects.order_by("-created_at")
        return success_response(ImportLogSerializer(queryset, many=True).data)
