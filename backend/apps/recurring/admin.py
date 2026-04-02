from django.contrib import admin

from apps.recurring.models import RecurringEvidenceInstance, RecurringRequirement


@admin.register(RecurringRequirement)
class RecurringRequirementAdmin(admin.ModelAdmin):
    list_display = ("id", "project_indicator", "frequency", "mode", "start_date", "end_date", "is_active")
    list_filter = ("frequency", "mode", "is_active")
    autocomplete_fields = ("project_indicator",)
    search_fields = ("project_indicator__project__name", "project_indicator__indicator__code")


@admin.register(RecurringEvidenceInstance)
class RecurringEvidenceInstanceAdmin(admin.ModelAdmin):
    list_display = ("id", "recurring_requirement", "due_date", "period_label", "status", "linked_evidence_item")
    list_filter = ("status", "recurring_requirement__frequency")
    autocomplete_fields = ("recurring_requirement", "linked_evidence_item")
