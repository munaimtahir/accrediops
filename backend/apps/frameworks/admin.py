from django.contrib import admin

from apps.frameworks.models import Area, Framework, Standard


@admin.register(Framework)
class FrameworkAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    ordering = ("name",)
    search_fields = ("name", "description")


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ("id", "framework", "code", "name", "sort_order")
    list_filter = ("framework",)
    autocomplete_fields = ("framework",)
    ordering = ("framework", "sort_order", "code")
    search_fields = ("code", "name", "framework__name")


@admin.register(Standard)
class StandardAdmin(admin.ModelAdmin):
    list_display = ("id", "framework", "area", "code", "name", "sort_order")
    list_filter = ("framework", "area")
    autocomplete_fields = ("framework", "area")
    ordering = ("framework", "area__sort_order", "sort_order", "code")
    search_fields = ("code", "name", "area__name", "framework__name")
