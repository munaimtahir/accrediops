from django.contrib import admin

from apps.audit.models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("id", "event_type", "object_type", "object_id", "actor", "reason", "timestamp")
    list_filter = ("event_type", "object_type", "timestamp")
    date_hierarchy = "timestamp"
    list_select_related = ("actor",)
    search_fields = ("event_type", "object_type", "object_id", "actor__username")
    readonly_fields = (
        "actor",
        "event_type",
        "object_type",
        "object_id",
        "before_json",
        "after_json",
        "reason",
        "timestamp",
    )
