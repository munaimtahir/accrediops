from django.contrib import admin

from apps.projects.models import AccreditationProject


@admin.register(AccreditationProject)
class AccreditationProjectAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "client_name",
        "client_profile",
        "accrediting_body_name",
        "framework",
        "status",
        "start_date",
        "target_date",
        "created_by",
    )
    list_filter = ("status", "framework", "accrediting_body_name")
    search_fields = ("name", "client_name", "accrediting_body_name")
