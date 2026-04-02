from rest_framework import serializers

from apps.accounts.models import User
from apps.audit.models import AuditEvent


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "role")


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
