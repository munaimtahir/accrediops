from rest_framework import serializers

from apps.api.serializers.project_indicators import (
    EvidenceRequirementSerializer,
    ProjectEvidenceRequirementSerializer,
)
from apps.indicators.models import EvidenceRequirement, Indicator, ProjectEvidenceRequirement
from apps.masters.choices import ProjectEvidenceRequirementStatusChoices


class EvidenceRequirementWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    evidence_category = serializers.ChoiceField(
        choices=EvidenceRequirement._meta.get_field("evidence_category").choices,
    )
    artifact_type = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    mandatory = serializers.BooleanField(required=False, default=True)
    ai_generatable = serializers.BooleanField(required=False, default=False)
    physical_proof_required = serializers.BooleanField(required=False, default=False)
    signature_required = serializers.BooleanField(required=False, default=False)
    ongoing_record_required = serializers.BooleanField(required=False, default=False)
    default_document_type = serializers.ChoiceField(
        choices=EvidenceRequirement._meta.get_field("default_document_type").choices,
        required=False,
        allow_blank=True,
        default="",
    )
    primary_action_required = serializers.ChoiceField(
        choices=EvidenceRequirement._meta.get_field("primary_action_required").choices,
        required=False,
        allow_blank=True,
        default="",
    )
    display_order = serializers.IntegerField(required=False, min_value=0, default=0)
    is_active = serializers.BooleanField(required=False, default=True)


class ProjectEvidenceRequirementUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ProjectEvidenceRequirementStatusChoices.choices, required=False)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectEvidenceRequirement._meta.get_field("assigned_to").remote_field.model.objects.all(),
        source="assigned_to",
        required=False,
        allow_null=True,
    )
    due_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    gap_summary = serializers.CharField(required=False, allow_blank=True)
    review_notes = serializers.CharField(required=False, allow_blank=True)


class ProjectEvidenceRequirementSubmitSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class ProjectEvidenceRequirementApproveSerializer(serializers.Serializer):
    review_notes = serializers.CharField(required=False, allow_blank=True, default="")


class ProjectEvidenceRequirementRejectSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField()


__all__ = [
    "EvidenceRequirementSerializer",
    "ProjectEvidenceRequirementSerializer",
    "EvidenceRequirementWriteSerializer",
    "ProjectEvidenceRequirementUpdateSerializer",
    "ProjectEvidenceRequirementSubmitSerializer",
    "ProjectEvidenceRequirementApproveSerializer",
    "ProjectEvidenceRequirementRejectSerializer",
    "Indicator",
    "EvidenceRequirement",
    "ProjectEvidenceRequirement",
]
