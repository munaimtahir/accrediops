from rest_framework import serializers

from apps.accounts.models import ClientProfile, User
from apps.audit.models import AuditEvent
from apps.frameworks.models import Framework
from apps.frameworks.services import REQUIRED_TEMPLATE_COLUMNS, TEMPLATE_COLUMNS


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "role", "is_active")


class UserWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "role", "is_active", "password")

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class PasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)


class ClientProfileSerializer(serializers.ModelSerializer):
    linked_users = UserSummarySerializer(many=True, read_only=True)
    linked_user_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(is_active=True),
        source="linked_users",
        required=False,
    )

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
            "linked_users",
            "linked_user_ids",
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


class FrameworkTemplateSerializer(serializers.Serializer):
    version = serializers.CharField()
    columns = serializers.ListField(child=serializers.CharField(), default=TEMPLATE_COLUMNS)
    required_columns = serializers.ListField(child=serializers.CharField(), default=REQUIRED_TEMPLATE_COLUMNS)
    sample_rows = serializers.ListField(child=serializers.DictField())
    template_csv = serializers.CharField()
