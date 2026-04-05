from rest_framework import serializers

from apps.accounts.models import User
from apps.audit.models import AuditEvent
from apps.exports.models import ExportJob, ImportLog
from apps.masters.models import MasterValue


class MasterValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterValue
        fields = ("id", "key", "code", "label", "is_active", "sort_order", "created_at", "updated_at")


class UserAdminSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_active",
            "department",
            "department_name",
        )


class AuditEventAdminSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = AuditEvent
        fields = (
            "id",
            "actor",
            "actor_username",
            "event_type",
            "object_type",
            "object_id",
            "before_json",
            "after_json",
            "reason",
            "timestamp",
        )


class ExportJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportJob
        fields = (
            "id",
            "project",
            "type",
            "created_by",
            "created_at",
            "status",
            "file_name",
            "parameters",
            "warnings",
        )


class ImportLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportLog
        fields = ("id", "file_name", "rows_processed", "errors", "created_at")
