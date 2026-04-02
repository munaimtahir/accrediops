from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from apps.api.responses import success_response
from apps.projects.models import AccreditationProject


class ProjectExcelExportView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        return success_response(
            {
                "format": "excel",
                "project_id": project.id,
                "status": "placeholder",
                "message": "Excel export generation is not wired yet.",
            }
        )


class ProjectPrintBundleExportView(APIView):
    def get(self, request, project_id):
        project = get_object_or_404(AccreditationProject, pk=project_id)
        return success_response(
            {
                "format": "print-bundle",
                "project_id": project.id,
                "status": "placeholder",
                "message": "Print bundle generation is not wired yet.",
            }
        )
