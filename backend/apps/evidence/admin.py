from django.contrib import admin

from apps.evidence.models import EvidenceItem


@admin.register(EvidenceItem)
class EvidenceItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project_indicator",
        "title",
        "source_type",
        "version_no",
        "is_current",
        "approval_status",
        "reviewed_by",
        "uploaded_by",
        "uploaded_at",
    )
    list_filter = ("source_type", "is_current", "approval_status", "validity_status", "completeness_status")
    autocomplete_fields = ("project_indicator", "uploaded_by", "reviewed_by")
    search_fields = ("title", "description", "file_or_url", "project_indicator__indicator__code")
