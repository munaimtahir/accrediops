from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import Department, User


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    ordering = ("name",)
    search_fields = ("name",)


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
