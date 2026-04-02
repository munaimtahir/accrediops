from rest_framework import serializers

from apps.evidence.models import EvidenceItem
from apps.indicators.models import ProjectIndicator
from apps.masters.choices import (
    EvidenceApprovalStatusChoices,
    EvidenceCompletenessStatusChoices,
    EvidenceSourceTypeChoices,
    EvidenceValidityStatusChoices,
)


class EvidenceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvidenceItem
        fields = (
            "id",
            "project_indicator",
            "title",
            "description",
            "source_type",
            "file_or_url",
            "text_content",
            "version_no",
            "is_current",
            "evidence_date",
            "uploaded_by",
            "uploaded_at",
            "notes",
            "validity_status",
            "completeness_status",
            "approval_status",
            "reviewed_by",
            "reviewed_at",
            "review_notes",
        )


class CreateEvidenceSerializer(serializers.Serializer):
    project_indicator_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectIndicator.objects.all(),
        source="project_indicator",
    )
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True, default="")
    source_type = serializers.ChoiceField(choices=EvidenceSourceTypeChoices.choices)
    file_or_url = serializers.CharField(required=False, allow_blank=True, default="")
    text_content = serializers.CharField(required=False, allow_blank=True, default="")
    evidence_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class UpdateEvidenceSerializer(serializers.Serializer):
    title = serializers.CharField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    file_or_url = serializers.CharField(required=False, allow_blank=True)
    text_content = serializers.CharField(required=False, allow_blank=True)
    evidence_date = serializers.DateField(required=False, allow_null=True)


class EvidenceReviewSerializer(serializers.Serializer):
    validity_status = serializers.ChoiceField(choices=EvidenceValidityStatusChoices.choices)
    completeness_status = serializers.ChoiceField(choices=EvidenceCompletenessStatusChoices.choices)
    approval_status = serializers.ChoiceField(choices=EvidenceApprovalStatusChoices.choices)
    review_notes = serializers.CharField(required=False, allow_blank=True, default="")
