from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.exports.services import build_print_bundle, export_validation_warnings, upsert_print_pack_items
from apps.projects.models import AccreditationProject


class ProjectExcelExportView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        upsert_print_pack_items(project)
        bundle = build_print_bundle(project)
        warnings = export_validation_warnings(project)
        return success_response(
            {
                "format": "excel",
                "project_id": project.id,
                "status": "warning" if warnings else "ready",
                "message": "Structured excel export payload generated.",
                "bundle": bundle,
                "warnings": warnings,
            }
        )


class ProjectPrintBundleExportView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        upsert_print_pack_items(project)
        bundle = build_print_bundle(project)
        warnings = export_validation_warnings(project)
        return success_response(
            {
                "format": "print-bundle",
                "project_id": project.id,
                "status": "warning" if warnings else "ready",
                "message": "Structured print bundle generated.",
                "sections": bundle["sections"],
                "warnings": warnings,
            }
        )


class ProjectPhysicalRetrievalExportView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
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
        return success_response(
            {
                "format": "physical-retrieval",
                "project_id": project.id,
                "status": "ready",
                "items": items,
            }
        )
