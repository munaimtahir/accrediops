from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction, models
from django.db.models import Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.api.exceptions import ConflictError
from apps.api.responses import success_response
from apps.api.serializers.admin import (
    AuditEventAdminSerializer,
    BulkClassificationReviewSerializer,
    ClassificationRunSerializer,
    ExportJobSerializer,
    FrameworkImportSerializer,
    FrameworkWriteSerializer,
    IndicatorClassificationSerializer,
    IndicatorClassificationUpdateSerializer,
    ImportLogSerializer,
    MasterValueSerializer,
    UserAdminSerializer,
    AIUsageLogSerializer,
    DocumentDraftSerializer,
    DocumentDraftWriteSerializer,
    PromoteDraftToEvidenceSerializer,
)
from apps.ai_actions.models import AIUsageLog, DocumentDraft
from apps.ai_actions.services.classification import run_framework_indicator_classification
from apps.ai_actions.services.document_drafting import generate_document_draft, promote_draft_to_evidence
from apps.frameworks.models import Framework
from apps.indicators.models import Indicator
from apps.masters.choices import ClassificationReviewStatusChoices
from apps.frameworks.services import (
    import_framework_checklist,
    parse_framework_csv,
    validate_framework_rows,
)
from apps.audit.models import AuditEvent
from apps.exports.models import ExportJob, ImportLog
from apps.exports.services import (
    create_export_job,
    log_framework_import,
)
from apps.exports.services_admin import admin_dashboard_summary, project_readiness
from apps.masters.models import MasterValue
from apps.masters.services import ensure_master_key
from apps.projects.models import AccreditationProject
from apps.projects.services import initialize_project_from_framework
from apps.workflow.permissions import AdminOrLeadPermission


class AdminDashboardView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request):
        return success_response(admin_dashboard_summary())


class MasterValueListCreateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, key):
        ensure_master_key(key)
        queryset = MasterValue.objects.filter(key=key).order_by("sort_order", "code")
        return success_response(MasterValueSerializer(queryset, many=True).data)

    def post(self, request, key):
        ensure_master_key(key)
        serializer = MasterValueSerializer(data={**request.data, "key": key})
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return success_response(MasterValueSerializer(item).data, response_status=201)


class MasterValueUpdateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def patch(self, request, key, pk):
        ensure_master_key(key)
        item = get_object_or_404(MasterValue, pk=pk, key=key)
        serializer = MasterValueSerializer(item, data={**request.data, "key": key}, partial=True)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return success_response(MasterValueSerializer(item).data)


class AdminUsersView(generics.ListCreateAPIView):
    serializer_class = UserAdminSerializer
    permission_classes = [AdminOrLeadPermission]

    def get_queryset(self):
        return User.objects.select_related("department").order_by("username")

    def list(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_queryset(), many=True).data)

    def post(self, request, *args, **kwargs):
        if request.user.role != "ADMIN":
            raise PermissionDenied("Only ADMIN can create users.")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(self.get_serializer(user).data, response_status=201)


class AdminUserUpdateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserAdminSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(UserAdminSerializer(user).data)


class AdminUserPasswordResetView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def post(self, request, pk):
        if request.user.role != "ADMIN":
            raise PermissionDenied("Only ADMIN can reset passwords.")
        user = get_object_or_404(User, pk=pk)
        password = request.data.get("password")
        if not password:
            raise DjangoValidationError({"password": ["This field is required."]})
        user.set_password(password)
        user.save()
        return success_response({"message": "Password reset successfully."})


class AuditLogView(generics.ListAPIView):
    serializer_class = AuditEventAdminSerializer
    permission_classes = [AdminOrLeadPermission]

    def get_queryset(self):
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
    permission_classes = [AdminOrLeadPermission]

    def get(self, request):
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
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        return success_response(project_readiness(project))


class ExportHistoryView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        queryset = ExportJob.objects.filter(project=project).order_by("-created_at")
        return success_response(ExportJobSerializer(queryset, many=True).data)


class ExportGenerateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def post(self, request, project_id):
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


def _decode_framework_upload(uploaded_file) -> str:
    file_name = (uploaded_file.name or "").lower()
    if not file_name.endswith(".csv"):
        raise DjangoValidationError({"file": ["Checklist import accepts CSV files only."]})
    payload = uploaded_file.read()
    uploaded_file.seek(0)
    if not payload:
        raise DjangoValidationError({"file": ["Checklist file is empty."]})
    try:
        return payload.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise DjangoValidationError({"file": ["Checklist file must be UTF-8 encoded CSV."]}) from exc


def _build_framework_validation_payload(*, framework_id: int, file_name: str, rows: list[dict], errors: list[dict]) -> dict:
    duplicate_warnings = [
        row
        for row in errors
        if str(row.get("error", "")).startswith("duplicate_")
    ]
    missing_required_values = sum(1 for row in errors if row.get("error") == "missing_fields")
    normalized_rows = max(len(rows) - len(errors), 0)
    return {
        "framework_id": framework_id,
        "file_name": file_name,
        "rows_processed": len(rows),
        "normalized_rows": normalized_rows,
        "missing_headers": [],
        "missing_required_values": missing_required_values,
        "duplicate_warnings": duplicate_warnings,
        "errors": errors,
    }


class FrameworkImportValidateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def post(self, request):
        serializer = FrameworkImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        framework_id = serializer.validated_data["framework_id"]
        get_object_or_404(Framework, pk=framework_id)
        uploaded_file = serializer.validated_data["file"]
        file_name = uploaded_file.name or "framework-checklist.csv"
        try:
            csv_text = _decode_framework_upload(uploaded_file)
            rows = parse_framework_csv(csv_text)
        except DjangoValidationError as exc:
            details = getattr(exc, "message_dict", {"non_field_errors": exc.messages})
            missing_headers = details.get("missing_headers", []) if isinstance(details, dict) else []
            errors = [{"row": 0, "error": "invalid_file", "details": details}]
            result = {
                "framework_id": framework_id,
                "file_name": file_name,
                "rows_processed": 0,
                "normalized_rows": 0,
                "missing_headers": missing_headers,
                "missing_required_values": 0,
                "duplicate_warnings": [],
                "errors": errors,
            }
            log = log_framework_import(
                file_name=file_name,
                rows_processed=0,
                errors=errors,
            )
            return success_response(result | {"log_id": log.id})

        _, errors = validate_framework_rows(rows)
        result = _build_framework_validation_payload(
            framework_id=framework_id,
            file_name=file_name,
            rows=rows,
            errors=errors,
        )
        log = log_framework_import(
            file_name=file_name,
            rows_processed=result["rows_processed"],
            errors=result["errors"],
        )
        payload = result | {"log_id": log.id}
        return success_response(payload)


class ImportLogListView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request):
        queryset = ImportLog.objects.order_by("-created_at")
        return success_response(ImportLogSerializer(queryset, many=True).data)


class AIUsageLogListView(generics.ListAPIView):
    serializer_class = AIUsageLogSerializer
    permission_classes = [AdminOrLeadPermission]

    def get_queryset(self):
        queryset = AIUsageLog.objects.select_related("user", "framework", "project").order_by("-timestamp")
        params = self.request.query_params
        if params.get("user"):
            queryset = queryset.filter(user_id=params["user"])
        if params.get("feature"):
            queryset = queryset.filter(feature=params["feature"])
        if params.get("is_success"):
            queryset = queryset.filter(is_success=params["is_success"] == "true")
        return queryset

    def list(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_queryset(), many=True).data)


class DocumentGenerationQueueView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request):
        queryset = Indicator.objects.filter(
            primary_action_required="GENERATE_DOCUMENT",
            ai_assistance_level__in=["FULL_AI", "PARTIAL_AI"],
            is_active=True,
        ).select_related("framework", "area", "standard", "classification_reviewed_by")

        # Basic filtering
        framework_id = request.query_params.get("framework")
        if framework_id:
            queryset = queryset.filter(framework_id=framework_id)

        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(code__icontains=search) | Q(text__icontains=search))

        # Annotate with latest draft info
        queryset = queryset.annotate(
            latest_draft_id=models.Max(
                models.Subquery(
                    DocumentDraft.objects.filter(
                        indicator=models.OuterRef('pk'),
                        project_indicator__isnull=True, # Framework-level drafts
                        review_status__in=['DRAFT', 'HUMAN_REVIEW_REQUIRED', 'HUMAN_REVIEWED']
                    ).order_by('-version', '-generated_at').values('id')[:1]
                )
            ),
            draft_count=models.Count(
                models.Case(
                    models.When(document_drafts__project_indicator__isnull=True, then=1),
                    default=0,
                    output_field=models.IntegerField()
                )
            ),
        )

        draft_ids_to_fetch = [
            indicator.latest_draft_id for indicator in queryset if indicator.latest_draft_id
        ]
        drafts_dict = DocumentDraft.objects.in_bulk(draft_ids_to_fetch)

        indicators = []
        for indicator in queryset:
            data = IndicatorClassificationSerializer(indicator).data
            data['latest_draft'] = None
            data['draft_count'] = indicator.draft_count
            if indicator.latest_draft_id:
                latest_draft = drafts_dict.get(indicator.latest_draft_id)
                if latest_draft:
                    data['latest_draft'] = {
                        'id': latest_draft.id,
                        'title': latest_draft.title,
                        'review_status': latest_draft.review_status,
                        'generated_at': latest_draft.generated_at,
                        'version': latest_draft.version,
                    }
            indicators.append(data)

        return success_response({
            "results": indicators
        })


class DocumentDraftGenerateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def post(self, request, indicator_id):
        indicator = get_object_or_404(Indicator, pk=indicator_id)
        framework = indicator.framework

        # Determine if project-specific or framework-level
        project_id = request.data.get("project_id")
        project_indicator_id = request.data.get("project_indicator_id")
        project = None
        project_indicator = None

        if project_id and project_indicator_id:
            project = get_object_or_404(AccreditationProject, pk=project_id)
            project_indicator = get_object_or_404(ProjectIndicator, pk=project_indicator_id, project=project, indicator=indicator)
            if project_indicator.indicator != indicator:
                raise ValidationError("Project indicator does not match indicator ID.")
        elif project_id or project_indicator_id:
             raise ValidationError("Both project_id and project_indicator_id must be provided for project-specific drafts, or neither for framework drafts.")

        draft = generate_document_draft(
            actor=request.user,
            framework=framework,
            indicator=indicator,
            project=project,
            project_indicator=project_indicator,
            user_instruction=request.data.get("user_instruction", ""),
            document_type_override=request.data.get("document_type_override"),
        )
        return success_response(DocumentDraftSerializer(draft).data, response_status=201)


class DocumentDraftListCreateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request):
        queryset = DocumentDraft.objects.all().select_related(
            "framework", "indicator", "project", "project_indicator", "generated_by"
        ).order_by("-generated_at")

        framework_id = request.query_params.get("framework_id")
        if framework_id:
            queryset = queryset.filter(framework_id=framework_id)

        indicator_id = request.query_params.get("indicator_id")
        if indicator_id:
            queryset = queryset.filter(indicator_id=indicator_id)

        project_id = request.query_params.get("project_id")
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        review_status = request.query_params.get("review_status")
        if review_status:
            queryset = queryset.filter(review_status=review_status)

        return success_response(DocumentDraftSerializer(queryset, many=True).data)


class DocumentDraftRetrieveUpdateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, pk):
        draft = get_object_or_404(DocumentDraft, pk=pk)
        return success_response(DocumentDraftSerializer(draft).data)

    def patch(self, request, pk):
        draft = get_object_or_404(DocumentDraft, pk=pk)
        serializer = DocumentDraftWriteSerializer(draft, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        draft = serializer.save(last_edited_by=request.user, last_edited_at=timezone.now())
        return success_response(DocumentDraftSerializer(draft).data)


class DocumentDraftPromoteToEvidenceView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def post(self, request, pk):
        draft = get_object_or_404(DocumentDraft, pk=pk)
        serializer = PromoteDraftToEvidenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        project = get_object_or_404(AccreditationProject, pk=payload["project_id"])
        project_indicator = get_object_or_404(ProjectIndicator, pk=payload["project_indicator_id"], project=project)

        promoted_draft = promote_draft_to_evidence(
            actor=request.user,
            document_draft=draft,
            project=project,
            project_indicator=project_indicator,
            evidence_title=payload["evidence_title"],
            evidence_type=payload["evidence_type"],
            document_type=payload["document_type"],
            final_filename=payload["final_filename"],
            notes=payload["notes"],
        )
        return success_response(DocumentDraftSerializer(promoted_draft).data, response_status=200)

class FrameworkAdminListCreateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request):
        queryset = Framework.objects.order_by("name")
        return success_response(FrameworkWriteSerializer(queryset, many=True).data)

    def post(self, request):
        serializer = FrameworkWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        framework = serializer.save()
        return success_response(FrameworkWriteSerializer(framework).data, response_status=201)


class FrameworkImportCreateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def post(self, request):
        serializer = FrameworkImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        framework_id = serializer.validated_data["framework_id"]
        framework = get_object_or_404(Framework, pk=framework_id)
        uploaded_file = serializer.validated_data["file"]
        file_name = uploaded_file.name or "framework-checklist.csv"

        if framework.projects.exists():
            errors = [{"error": "framework_in_use", "framework_id": framework.id}]
            log_framework_import(file_name=file_name, rows_processed=0, errors=errors)
            raise ConflictError(
                "Selected framework is already linked to active projects. Cannot overwrite indicators safely."
            )

        try:
            csv_text = _decode_framework_upload(uploaded_file)
            rows = parse_framework_csv(csv_text)
        except DjangoValidationError as exc:
            details = getattr(exc, "message_dict", {"non_field_errors": exc.messages})
            log_framework_import(
                file_name=file_name,
                rows_processed=0,
                errors=[{"error": "invalid_file", "details": details}],
            )
            raise

        with transaction.atomic():
            payload = import_framework_checklist(
                actor=request.user,
                framework=framework,
                file_name=file_name,
                rows=rows,
            )

        response_payload = payload | {
            "framework_id": framework.id,
            "file_name": file_name,
        }
        return success_response(response_payload, response_status=201)


def _classification_filtered_queryset(framework, params):
    queryset = Indicator.objects.filter(framework=framework, is_active=True).select_related(
        "area",
        "standard",
        "classification_reviewed_by",
    )
    for field in (
        "evidence_type",
        "ai_assistance_level",
        "evidence_frequency",
        "primary_action_required",
        "classification_review_status",
        "classification_confidence",
    ):
        if params.get(field):
            queryset = queryset.filter(**{field: params[field]})
    if params.get("area"):
        queryset = queryset.filter(Q(area_id=params["area"]) | Q(area__code=params["area"]) | Q(area__name__icontains=params["area"]))
    if params.get("standard"):
        queryset = queryset.filter(
            Q(standard_id=params["standard"]) | Q(standard__code=params["standard"]) | Q(standard__name__icontains=params["standard"])
        )
    if params.get("search"):
        search = params["search"]
        queryset = queryset.filter(Q(code__icontains=search) | Q(text__icontains=search))
    return queryset.order_by("area__sort_order", "standard__sort_order", "sort_order", "code")


def _classification_summary(framework) -> dict:
    indicators = Indicator.objects.filter(framework=framework, is_active=True)
    return {
        "total": indicators.count(),
        "unclassified": indicators.filter(
            classification_review_status=ClassificationReviewStatusChoices.UNCLASSIFIED
        ).count(),
        "ai_suggested": indicators.filter(
            classification_review_status=ClassificationReviewStatusChoices.AI_SUGGESTED
        ).count(),
        "needs_review": indicators.filter(
            classification_review_status=ClassificationReviewStatusChoices.NEEDS_REVIEW
        ).count(),
        "human_reviewed": indicators.filter(
            classification_review_status=ClassificationReviewStatusChoices.HUMAN_REVIEWED
        ).count(),
        "full_ai": indicators.filter(ai_assistance_level="FULL_AI").count(),
        "recurring": indicators.filter(evidence_frequency="RECURRING").count(),
        "physical_no_ai": indicators.filter(Q(evidence_type="PHYSICAL_FACILITY") | Q(ai_assistance_level="NO_AI")).count(),
    }


class FrameworkClassificationView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, framework_id):
        framework = get_object_or_404(Framework, pk=framework_id)
        queryset = _classification_filtered_queryset(framework, request.query_params)
        return success_response(
            {
                "framework": FrameworkWriteSerializer(framework).data,
                "summary": _classification_summary(framework),
                "results": IndicatorClassificationSerializer(queryset, many=True).data,
            }
        )


class FrameworkClassifyIndicatorsView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def post(self, request, framework_id):
        framework = get_object_or_404(Framework, pk=framework_id)
        serializer = ClassificationRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        if payload["mode"] == "force_all" and not payload.get("confirm_force"):
            raise DjangoValidationError({"confirm_force": ["Force reclassification requires confirmation."]})
        result = run_framework_indicator_classification(
            framework=framework,
            actor=request.user,
            mode=payload["mode"],
            indicator_ids=payload.get("indicator_ids") or [],
            overwrite_human_reviewed=payload["overwrite_human_reviewed"],
        )
        return success_response(result)


class IndicatorClassificationUpdateView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def patch(self, request, indicator_id):
        indicator = get_object_or_404(
            Indicator.objects.select_related("area", "standard", "classification_reviewed_by"),
            pk=indicator_id,
        )
        serializer = IndicatorClassificationUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        classification_fields = {
            "evidence_type",
            "ai_assistance_level",
            "evidence_frequency",
            "primary_action_required",
        }
        changed_classification = any(
            field in values and getattr(indicator, field) != values[field] for field in classification_fields
        )
        for field, value in values.items():
            setattr(indicator, field, value)
        if "classification_review_status" not in values:
            indicator.classification_review_status = (
                ClassificationReviewStatusChoices.MANUALLY_CHANGED
                if changed_classification
                else ClassificationReviewStatusChoices.HUMAN_REVIEWED
            )
        indicator.classification_reviewed_by = request.user
        indicator.classification_reviewed_at = timezone.now()
        indicator.classification_version = (indicator.classification_version or 0) + 1
        indicator.save()
        return success_response(IndicatorClassificationSerializer(indicator).data)


class FrameworkClassificationBulkReviewView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def post(self, request, framework_id):
        framework = get_object_or_404(Framework, pk=framework_id)
        serializer = BulkClassificationReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        
        mode = payload.get("mode", "selected")
        
        if mode == "selected":
            if not payload.get("indicator_ids"):
                raise DjangoValidationError({"indicator_ids": ["This field is required for selected mode."]})
            queryset = Indicator.objects.filter(framework=framework, id__in=payload["indicator_ids"])
        elif mode == "ai_suggested":
            queryset = Indicator.objects.filter(
                framework=framework,
                classification_review_status=ClassificationReviewStatusChoices.AI_SUGGESTED
            ).exclude(classification_confidence="LOW")
        elif mode == "filtered":
            queryset = _classification_filtered_queryset(framework, payload.get("filters") or {})
            # Safety: don't approve unclassified in filtered mode unless explicit
            if payload["action"] == "approve":
                queryset = queryset.exclude(classification_review_status=ClassificationReviewStatusChoices.UNCLASSIFIED)
        else:
            queryset = Indicator.objects.none()

        indicators = list(queryset.select_related("area", "standard", "classification_reviewed_by"))
        skipped_count = 0
        
        indicators_to_update = []
        updates = payload.get("updates") or {}
        update_fields = set(updates.keys())
        update_fields.update([
            "classification_review_status",
            "classification_reviewed_by",
            "classification_reviewed_at",
            "classification_version"
        ])

        now = timezone.now()

        with transaction.atomic():
            for indicator in indicators:
                # Protect manually changed rows in bulk modes
                if mode != "selected" and indicator.classification_review_status == ClassificationReviewStatusChoices.MANUALLY_CHANGED:
                    skipped_count += 1
                    continue

                for field, value in updates.items():
                    setattr(indicator, field, value)
                
                indicator.classification_review_status = (
                    ClassificationReviewStatusChoices.HUMAN_REVIEWED
                    if payload["action"] == "approve"
                    else ClassificationReviewStatusChoices.NEEDS_REVIEW
                )
                indicator.classification_reviewed_by = request.user
                indicator.classification_reviewed_at = now
                indicator.classification_version = (indicator.classification_version or 0) + 1

                indicators_to_update.append(indicator)

            if indicators_to_update:
                Indicator.objects.bulk_update(indicators_to_update, fields=list(update_fields), batch_size=500)
        
        return success_response(
            {
                "updated_count": len(indicators) - skipped_count,
                "skipped_count": skipped_count,
                "results": IndicatorClassificationSerializer(indicators[:100], many=True).data,
            }
        )
