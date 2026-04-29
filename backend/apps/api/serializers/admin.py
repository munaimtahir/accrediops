from rest_framework import serializers

from apps.accounts.models import User
from apps.ai_actions.models import AIUsageLog, DocumentDraft
from apps.audit.models import AuditEvent
from apps.exports.models import ExportJob, ImportLog
from apps.frameworks.models import Framework
from apps.indicators.models import Indicator
from apps.masters.choices import (
    AIAssistanceLevelChoices,
    ClassificationReviewStatusChoices,
    EvidenceFrequencyChoices,
    EvidenceTypeChoices,
    PrimaryActionRequiredChoices,
)
from apps.masters.models import MasterValue


class MasterValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterValue
        fields = ("id", "key", "code", "label", "is_active", "sort_order", "created_at", "updated_at")


class AIUsageLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    framework_name = serializers.CharField(source="framework.name", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = AIUsageLog
        fields = "__all__"


class DocumentDraftSerializer(serializers.ModelSerializer):
    framework_name = serializers.CharField(source="framework.name", read_only=True)
    indicator_code = serializers.CharField(source="indicator.code", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    project_indicator_id = serializers.IntegerField(source="project_indicator.id", read_only=True)
    generated_by_username = serializers.CharField(source="generated_by.username", read_only=True)
    last_edited_by_username = serializers.CharField(source="last_edited_by.username", read_only=True)

    class Meta:
        model = DocumentDraft
        fields = "__all__"


class DocumentDraftWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentDraft
        fields = ("title", "draft_content", "review_status")


class PromoteDraftToEvidenceSerializer(serializers.Serializer):
    project_id = serializers.IntegerField(min_value=1)
    project_indicator_id = serializers.IntegerField(min_value=1)
    evidence_title = serializers.CharField(max_length=500)
    evidence_type = serializers.CharField(max_length=32)
    document_type = serializers.CharField(max_length=20)
    final_filename = serializers.CharField(max_length=255, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class UserAdminSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    password = serializers.CharField(write_only=True, required=False)

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
            "password",
        )

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


class FrameworkWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Framework
        fields = ("id", "name", "description")


class FrameworkImportSerializer(serializers.Serializer):
    framework_id = serializers.IntegerField(min_value=1)
    file = serializers.FileField()


class IndicatorClassificationSerializer(serializers.ModelSerializer):
    area_id = serializers.IntegerField(source="area.id", read_only=True)
    area_code = serializers.CharField(source="area.code", read_only=True)
    area_name = serializers.CharField(source="area.name", read_only=True)
    standard_id = serializers.IntegerField(source="standard.id", read_only=True)
    standard_code = serializers.CharField(source="standard.code", read_only=True)
    standard_name = serializers.CharField(source="standard.name", read_only=True)
    classification_reviewed_by_username = serializers.CharField(
        source="classification_reviewed_by.username",
        read_only=True,
    )

    class Meta:
        model = Indicator
        fields = (
            "id",
            "framework",
            "area_id",
            "area_code",
            "area_name",
            "standard_id",
            "standard_code",
            "standard_name",
            "code",
            "text",
            "required_evidence_description",
            "document_type",
            "fulfillment_guidance",
            "is_recurring",
            "recurrence_frequency",
            "evidence_type",
            "ai_assistance_level",
            "evidence_frequency",
            "primary_action_required",
            "classification_confidence",
            "classification_reason",
            "classification_review_status",
            "classified_by_ai_at",
            "classification_reviewed_by",
            "classification_reviewed_by_username",
            "classification_reviewed_at",
            "classification_version",
        )
        read_only_fields = fields


class IndicatorClassificationUpdateSerializer(serializers.Serializer):
    evidence_type = serializers.ChoiceField(choices=EvidenceTypeChoices.choices, required=False)
    ai_assistance_level = serializers.ChoiceField(choices=AIAssistanceLevelChoices.choices, required=False)
    evidence_frequency = serializers.ChoiceField(choices=EvidenceFrequencyChoices.choices, required=False)
    primary_action_required = serializers.ChoiceField(choices=PrimaryActionRequiredChoices.choices, required=False)
    classification_review_status = serializers.ChoiceField(
        choices=[
            (ClassificationReviewStatusChoices.HUMAN_REVIEWED, "Human Reviewed"),
            (ClassificationReviewStatusChoices.MANUALLY_CHANGED, "Manually Changed"),
            (ClassificationReviewStatusChoices.NEEDS_REVIEW, "Needs Review"),
        ],
        required=False,
    )
    classification_reason = serializers.CharField(required=False, allow_blank=True)


class ClassificationRunSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(
        choices=("unclassified_only", "selected", "unreviewed_only", "force_all"),
        default="unclassified_only",
        required=False,
    )
    indicator_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=True,
    )
    overwrite_human_reviewed = serializers.BooleanField(default=False, required=False)
    confirm_force = serializers.BooleanField(default=False, required=False)


class BulkClassificationReviewSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=("selected", "ai_suggested", "filtered"), default="selected")
    indicator_ids = serializers.ListField(child=serializers.IntegerField(min_value=1), required=False)
    action = serializers.ChoiceField(choices=("approve", "set_needs_review"))
    updates = IndicatorClassificationUpdateSerializer(required=False)
    filters = serializers.DictField(required=False)
