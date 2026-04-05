from django.contrib import admin

from apps.masters.models import MasterValue


@admin.register(MasterValue)
class MasterValueAdmin(admin.ModelAdmin):
    list_display = ("id", "key", "code", "label", "is_active", "sort_order")
    list_filter = ("key", "is_active")
    search_fields = ("key", "code", "label")
