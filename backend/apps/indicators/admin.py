from django.contrib import admin

from apps.indicators.models import (
    Indicator,
    ProjectIndicator,
    ProjectIndicatorComment,
    ProjectIndicatorStatusHistory,
)


@admin.register(Indicator)
class IndicatorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "framework",
        "area",
        "standard",
        "code",
        "is_recurring",
        "recurrence_frequency",
        "minimum_required_evidence_count",
        "is_active",
        "sort_order",
    )
    list_filter = ("framework", "area", "standard", "is_recurring", "is_active", "recurrence_frequency")
    ordering = ("framework", "area__sort_order", "standard__sort_order", "sort_order", "code")
    search_fields = ("code", "text", "standard__name", "area__name")


@admin.register(ProjectIndicator)
class ProjectIndicatorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project",
        "indicator",
        "current_status",
        "is_met",
        "is_finalized",
        "owner",
        "reviewer",
        "approver",
        "priority",
        "due_date",
        "last_updated_by",
        "last_updated_at",
    )
    list_filter = ("project", "current_status", "is_met", "priority", "indicator__is_recurring")
    autocomplete_fields = ("project", "indicator", "owner", "reviewer", "approver", "last_updated_by")
    search_fields = (
        "project__name",
        "indicator__code",
        "indicator__text",
        "owner__username",
        "reviewer__username",
        "approver__username",
    )


@admin.register(ProjectIndicatorComment)
class ProjectIndicatorCommentAdmin(admin.ModelAdmin):
    list_display = ("id", "project_indicator", "type", "created_by", "created_at")
    list_filter = ("type", "created_at")
    autocomplete_fields = ("project_indicator", "created_by")


@admin.register(ProjectIndicatorStatusHistory)
class ProjectIndicatorStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ("id", "project_indicator", "from_status", "to_status", "action", "actor", "timestamp")
    list_filter = ("from_status", "to_status", "action", "timestamp")
    autocomplete_fields = ("project_indicator", "actor")
