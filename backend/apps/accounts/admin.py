from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import ClientProfile, Department, User


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    ordering = ("name",)
    search_fields = ("name",)


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "organization_name",
        "license_number",
        "registration_number",
        "contact_person",
    )
    search_fields = (
        "organization_name",
        "license_number",
        "registration_number",
        "contact_person",
    )


@admin.register(User)
class AccrediOpsUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("AccrediOps", {"fields": ("department", "role")}),
    )
    list_display = ("username", "email", "role", "department", "is_staff")
    list_display_links = ("username",)
    list_filter = ("role", "department", "is_staff", "is_superuser")
    autocomplete_fields = ("department",)
    search_fields = UserAdmin.search_fields + ("department__name",)
