from rest_framework import serializers

from apps.evidence.models import EvidenceItem
from apps.masters.choices import EvidenceApprovalStatusChoices
from apps.recurring.models import RecurringEvidenceInstance, RecurringRequirement


class RecurringRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringRequirement
        fields = (
            "id",
            "frequency",
            "mode",
            "start_date",
            "end_date",
            "is_active",
            "instructions",
            "expected_title_template",
        )


class RecurringEvidenceInstanceSerializer(serializers.ModelSerializer):
    linked_evidence_title = serializers.CharField(source="linked_evidence_item.title", read_only=True)
    project_id = serializers.IntegerField(source="recurring_requirement.project_indicator.project_id", read_only=True)
    project_name = serializers.CharField(source="recurring_requirement.project_indicator.project.name", read_only=True)
    indicator_id = serializers.IntegerField(source="recurring_requirement.project_indicator.indicator_id", read_only=True)
    indicator_code = serializers.CharField(source="recurring_requirement.project_indicator.indicator.code", read_only=True)
    indicator_text = serializers.CharField(source="recurring_requirement.project_indicator.indicator.text", read_only=True)

    class Meta:
        model = RecurringEvidenceInstance
        fields = (
            "id",
            "project_id",
            "project_name",
            "indicator_id",
            "indicator_code",
            "indicator_text",
            "due_date",
            "period_label",
            "status",
            "linked_evidence_item",
            "linked_evidence_title",
            "submitted_at",
            "approved_at",
            "notes",
        )


class SubmitRecurringInstanceSerializer(serializers.Serializer):
    evidence_item_id = serializers.PrimaryKeyRelatedField(
        queryset=EvidenceItem.objects.all(),
        source="evidence_item",
        required=False,
        allow_null=True,
    )
    text_content = serializers.CharField(required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class ApproveRecurringInstanceSerializer(serializers.Serializer):
    approval_status = serializers.ChoiceField(
        choices=[
            EvidenceApprovalStatusChoices.APPROVED,
            EvidenceApprovalStatusChoices.REJECTED,
        ]
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")
