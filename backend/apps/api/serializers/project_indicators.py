from rest_framework import serializers

from apps.ai_actions.models import GeneratedOutput
from apps.api.serializers.ai_actions import GeneratedOutputSerializer
from apps.api.serializers.common import AuditEventSerializer, UserSummarySerializer
from apps.api.serializers.evidence import EvidenceItemSerializer
from apps.api.serializers.recurring import RecurringEvidenceInstanceSerializer, RecurringRequirementSerializer
from apps.indicators.models import (
    Indicator,
    ProjectIndicator,
    ProjectIndicatorComment,
    ProjectIndicatorStatusHistory,
)
from apps.masters.choices import PriorityChoices


class IndicatorMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicator
        fields = (
            "id",
            "framework",
            "area",
            "standard",
            "code",
            "text",
            "required_evidence_description",
            "evidence_type",
            "document_type",
            "fulfillment_guidance",
            "is_recurring",
            "recurrence_frequency",
            "recurrence_mode",
            "minimum_required_evidence_count",
            "reusable_template_allowed",
            "evidence_reuse_policy",
            "is_active",
            "sort_order",
        )


class ProjectIndicatorCommentSerializer(serializers.ModelSerializer):
    created_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = ProjectIndicatorComment
        fields = ("id", "type", "text", "created_by", "created_at")


class ProjectIndicatorStatusHistorySerializer(serializers.ModelSerializer):
    actor = UserSummarySerializer(read_only=True)

    class Meta:
        model = ProjectIndicatorStatusHistory
        fields = ("id", "from_status", "to_status", "action", "reason", "actor", "timestamp")


class ProjectIndicatorSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    reviewer = UserSummarySerializer(read_only=True)
    approver = UserSummarySerializer(read_only=True)
    indicator = IndicatorMasterSerializer(read_only=True)

    class Meta:
        model = ProjectIndicator
        fields = (
            "id",
            "project",
            "indicator",
            "current_status",
            "is_finalized",
            "is_met",
            "owner",
            "reviewer",
            "approver",
            "priority",
            "due_date",
            "notes",
            "last_updated_by",
            "last_updated_at",
        )


class DashboardWorklistSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(source="project.id", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    area_id = serializers.IntegerField(source="indicator.area.id", read_only=True)
    area_name = serializers.CharField(source="indicator.area.name", read_only=True)
    standard_id = serializers.IntegerField(source="indicator.standard.id", read_only=True)
    standard_name = serializers.CharField(source="indicator.standard.name", read_only=True)
    indicator_id = serializers.IntegerField(source="indicator.id", read_only=True)
    indicator_code = serializers.CharField(source="indicator.code", read_only=True)
    indicator_text = serializers.CharField(source="indicator.text", read_only=True)
    owner = UserSummarySerializer(read_only=True)
    is_recurring = serializers.BooleanField(source="indicator.is_recurring", read_only=True)
    recurrence_frequency = serializers.CharField(source="indicator.recurrence_frequency", read_only=True)
    approved_evidence_count = serializers.IntegerField(read_only=True)
    total_evidence_count = serializers.IntegerField(read_only=True)
    pending_recurring_instances_count = serializers.IntegerField(read_only=True)
    overdue_recurring_instances_count = serializers.IntegerField(read_only=True)
    project_indicator_id = serializers.IntegerField(source="id", read_only=True)

    class Meta:
        model = ProjectIndicator
        fields = (
            "project_indicator_id",
            "project_id",
            "project_name",
            "area_id",
            "area_name",
            "standard_id",
            "standard_name",
            "indicator_id",
            "indicator_code",
            "indicator_text",
            "current_status",
            "is_met",
            "priority",
            "owner",
            "due_date",
            "is_recurring",
            "recurrence_frequency",
            "approved_evidence_count",
            "total_evidence_count",
            "pending_recurring_instances_count",
            "overdue_recurring_instances_count",
            "last_updated_at",
        )


class ProjectIndicatorDetailSerializer(ProjectIndicatorSerializer):
    evidence_items = EvidenceItemSerializer(many=True, read_only=True)
    comments = ProjectIndicatorCommentSerializer(many=True, read_only=True)
    status_history = ProjectIndicatorStatusHistorySerializer(many=True, read_only=True)
    recurring_requirement = serializers.SerializerMethodField()
    recurring_instances = serializers.SerializerMethodField()
    ai_outputs = serializers.SerializerMethodField()
    audit_summary = serializers.SerializerMethodField()
    readiness_flags = serializers.SerializerMethodField()

    class Meta(ProjectIndicatorSerializer.Meta):
        fields = ProjectIndicatorSerializer.Meta.fields + (
            "evidence_items",
            "recurring_requirement",
            "recurring_instances",
            "comments",
            "status_history",
            "ai_outputs",
            "audit_summary",
            "readiness_flags",
        )

    def get_recurring_requirement(self, obj):
        requirement = getattr(obj, "recurring_requirement", None)
        if requirement is None:
            return None
        return RecurringRequirementSerializer(requirement).data

    def get_recurring_instances(self, obj):
        requirement = getattr(obj, "recurring_requirement", None)
        if requirement is None:
            return []
        return RecurringEvidenceInstanceSerializer(requirement.instances.all(), many=True).data

    def get_ai_outputs(self, obj):
        return GeneratedOutputSerializer(obj.generated_outputs.all(), many=True).data

    def get_audit_summary(self, obj):
        return AuditEventSerializer(self.context["audit_summary"], many=True).data

    def get_readiness_flags(self, obj):
        return self.context["readiness_flags"]


class AssignProjectIndicatorSerializer(serializers.Serializer):
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectIndicator._meta.get_field("owner").remote_field.model.objects.all(),
        source="owner",
        required=False,
        allow_null=True,
    )
    reviewer_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectIndicator._meta.get_field("reviewer").remote_field.model.objects.all(),
        source="reviewer",
        required=False,
        allow_null=True,
    )
    approver_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectIndicator._meta.get_field("approver").remote_field.model.objects.all(),
        source="approver",
        required=False,
        allow_null=True,
    )
    priority = serializers.ChoiceField(choices=PriorityChoices.choices, required=False)
    due_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class UpdateWorkingStateSerializer(serializers.Serializer):
    notes = serializers.CharField()
    due_date = serializers.DateField(required=False, allow_null=True)
    priority = serializers.ChoiceField(choices=PriorityChoices.choices, required=False)


class WorkflowActionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class ReopenWorkflowActionSerializer(serializers.Serializer):
    reason = serializers.CharField()
