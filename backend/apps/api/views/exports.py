from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.evidence.models import EvidenceItem
from apps.exports.services import (build_print_bundle,
                                   enforce_export_eligibility,
                                   log_export_audit, upsert_print_pack_items)
from apps.projects.models import AccreditationProject
from apps.workflow.permissions import AdminOrLeadPermission


class ProjectExcelExportView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        report = enforce_export_eligibility(project, "excel")
        upsert_print_pack_items(project)
        bundle = build_print_bundle(project)
        log_export_audit(
            project=project,
            actor=request.user,
            export_type="excel",
            event_type="export.preview_generated",
            details={"warning_count": len(report["warnings"])},
        )
        return success_response(
            {
                "format": "excel",
                "project_id": project.id,
                "status": "ready",
                "message": "Structured excel export payload generated.",
                "bundle": bundle,
                "warnings": [],
            }
        )


class ProjectPrintBundleExportView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        report = enforce_export_eligibility(project, "print-bundle")
        upsert_print_pack_items(project)
        bundle = build_print_bundle(project)
        log_export_audit(
            project=project,
            actor=request.user,
            export_type="print-bundle",
            event_type="export.preview_generated",
            details={"warning_count": len(report["warnings"])},
        )
        return success_response(
            {
                "format": "print-bundle",
                "project_id": project.id,
                "status": "ready",
                "message": "Structured print bundle generated.",
                "sections": bundle["sections"],
                "warnings": [],
            }
        )


class ProjectPhysicalRetrievalExportView(APIView):
    permission_classes = [AdminOrLeadPermission]

    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        enforce_export_eligibility(project, "physical-retrieval")
        upsert_print_pack_items(project)

        evidence_items = (
            EvidenceItem.objects.filter(
                project_indicator__project_id=project.id,
                is_current=True,
            )
            .filter(Q(is_physical_copy_available=True) | ~Q(physical_location_type=""))
            .annotate(pack_order=F("print_pack_items__order"))
            .order_by(
                "project_indicator__indicator__area__sort_order",
                "project_indicator__indicator__area__name",
                "project_indicator__indicator__standard__sort_order",
                "project_indicator__indicator__standard__name",
                "project_indicator__indicator__code",
                "pack_order",
                "id",
            )
            .values(
                "project_indicator__indicator__area__name",
                "project_indicator__indicator__standard__name",
                "project_indicator__indicator__code",
                "title",
                "physical_location_type",
                "location_details",
                "file_label",
            )
            .distinct()
        )

        items = [
            {
                "area": evidence["project_indicator__indicator__area__name"],
                "standard": evidence["project_indicator__indicator__standard__name"],
                "indicator_code": evidence["project_indicator__indicator__code"],
                "evidence_title": evidence["title"],
                "binder_or_location": evidence["physical_location_type"],
                "location_details": evidence["location_details"],
                "file_label": evidence["file_label"],
            }
            for evidence in evidence_items
        ]

        log_export_audit(
            project=project,
            actor=request.user,
            export_type="physical-retrieval",
            event_type="export.preview_generated",
            details={"item_count": len(items)},
        )
        return success_response(
            {
                "format": "physical-retrieval",
                "project_id": project.id,
                "status": "ready",
                "items": items,
            }
        )
