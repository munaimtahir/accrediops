from rest_framework import serializers
from apps.indicators.models import ProjectEvidenceRequirement

class ProjectEvidenceRequirementUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectEvidenceRequirement
        fields = ("status", "notes", "gap_summary", "assigned_to", "due_date")

    def update(self, instance, validated_data):
        from apps.indicators.services import update_project_evidence_requirement
        request = self.context.get('request')
        actor = request.user if request else None
        return update_project_evidence_requirement(
            actor=actor,
            project_evidence_requirement=instance,
            status=validated_data.get('status'),
            notes=validated_data.get('notes'),
            gap_summary=validated_data.get('gap_summary'),
            assigned_to=validated_data.get('assigned_to'),
            due_date=validated_data.get('due_date'),
        )

class ProjectEvidenceRequirementSerializer(serializers.ModelSerializer):
    evidence_requirement_title = serializers.CharField(source="evidence_requirement.title", read_only=True)
    mandatory = serializers.BooleanField(source="evidence_requirement.mandatory", read_only=True)

    class Meta:
        model = ProjectEvidenceRequirement
        fields = "__all__"

