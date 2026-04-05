from rest_framework import serializers

from apps.accounts.models import ClientProfile, User
from apps.audit.models import AuditEvent
from apps.frameworks.models import Framework


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "role")


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = (
            "id",
            "organization_name",
            "address",
            "license_number",
            "registration_number",
            "contact_person",
            "department_names",
            "created_at",
            "updated_at",
        )


class AuditEventSerializer(serializers.ModelSerializer):
    actor = UserSummarySerializer(read_only=True)

    class Meta:
        model = AuditEvent
        fields = (
            "id",
            "actor",
            "event_type",
            "object_type",
            "object_id",
            "before_json",
            "after_json",
            "reason",
            "timestamp",
        )


class FrameworkSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Framework
        fields = ("id", "name", "description")
