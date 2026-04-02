from django.contrib import admin

from apps.ai_actions.models import GeneratedOutput


@admin.register(GeneratedOutput)
class GeneratedOutputAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "project_indicator",
        "output_type",
        "model_name",
        "created_by",
        "accepted",
        "accepted_by",
        "created_at",
    )
    list_filter = ("output_type", "accepted", "created_at")
    autocomplete_fields = ("project_indicator", "created_by", "accepted_by")
    search_fields = ("project_indicator__indicator__code", "content", "model_name")
