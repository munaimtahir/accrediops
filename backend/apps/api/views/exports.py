from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.exports.services import (
    build_print_bundle,
    enforce_export_eligibility,
    log_export_audit,
    upsert_print_pack_items,
)
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
        bundle = build_print_bundle(project)
        items = []
        for section in bundle["sections"]:
            for standard in section["standards"]:
                for indicator in standard["indicators"]:
                    for evidence in indicator["evidence_list"]:
                        if evidence["is_physical_copy_available"] or evidence["physical_location_type"]:
                            items.append(
                                {
                                    "area": section["name"],
                                    "standard": standard["name"],
                                    "indicator_code": indicator["indicator_code"],
                                    "evidence_title": evidence["title"],
                                    "binder_or_location": evidence["physical_location_type"],
                                    "location_details": evidence["location_details"],
                                    "file_label": evidence["file_label"],
                                }
                            )
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
