from django.contrib import admin

from apps.exports.models import ExportJob, ImportLog, PrintPackItem


@admin.register(PrintPackItem)
class PrintPackItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project_indicator",
        "evidence_item",
        "order",
        "section_name",
    )
    list_filter = ("section_name",)
    search_fields = (
        "section_name",
        "notes",
        "project_indicator__indicator__code",
        "evidence_item__title",
    )


@admin.register(ExportJob)
class ExportJobAdmin(admin.ModelAdmin):
    list_display = ("id", "project", "type", "status", "file_name", "created_by", "created_at")
    list_filter = ("type", "status")
    search_fields = ("file_name", "project__name")


@admin.register(ImportLog)
class ImportLogAdmin(admin.ModelAdmin):
    list_display = ("id", "file_name", "rows_processed", "created_at")
    search_fields = ("file_name",)
