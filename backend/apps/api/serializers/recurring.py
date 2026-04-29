from rest_framework import serializers

from apps.evidence.models import EvidenceItem
from apps.masters.choices import EvidenceApprovalStatusChoices
from apps.recurring.models import RecurringEvidenceInstance, RecurringRequirement


from apps.workflow.permissions import can_project_owner_access, can_project_reviewer_access


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
    project_indicator_id = serializers.IntegerField(
        source="recurring_requirement.project_indicator.id",
        read_only=True,
    )
    linked_evidence_title = serializers.CharField(source="linked_evidence_item.title", read_only=True)
    project_id = serializers.IntegerField(source="recurring_requirement.project_indicator.project_id", read_only=True)
    project_name = serializers.CharField(source="recurring_requirement.project_indicator.project.name", read_only=True)
    indicator_id = serializers.IntegerField(source="recurring_requirement.project_indicator.indicator_id", read_only=True)
    indicator_code = serializers.CharField(source="recurring_requirement.project_indicator.indicator.code", read_only=True)
    indicator_text = serializers.CharField(source="recurring_requirement.project_indicator.indicator.text", read_only=True)
    capabilities = serializers.SerializerMethodField()

    class Meta:
        model = RecurringEvidenceInstance
        fields = (
            "id",
            "project_indicator_id",
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
            "capabilities",
        )

    def get_capabilities(self, obj: RecurringEvidenceInstance) -> dict:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return {
                "can_submit": False,
                "can_approve": False,
            }

        project_indicator = obj.recurring_requirement.project_indicator
        return {
            "can_submit": can_project_owner_access(request.user, project_indicator),
            "can_approve": can_project_reviewer_access(request.user, project_indicator),
        }



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
