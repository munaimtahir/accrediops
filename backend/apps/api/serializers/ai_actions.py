from rest_framework import serializers

from apps.ai_actions.models import GeneratedOutput
from apps.indicators.models import ProjectIndicator
from apps.masters.choices import GeneratedOutputTypeChoices


class GeneratedOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedOutput
        fields = (
            "id",
            "project_indicator",
            "output_type",
            "prompt_context_snapshot",
            "content",
            "model_name",
            "created_by",
            "created_at",
            "accepted",
            "accepted_at",
            "accepted_by",
        )


class GenerateAIOutputSerializer(serializers.Serializer):
    project_indicator_id = serializers.PrimaryKeyRelatedField(
        queryset=ProjectIndicator.objects.all(),
        source="project_indicator",
    )
    output_type = serializers.ChoiceField(choices=GeneratedOutputTypeChoices.choices)
    user_instruction = serializers.CharField(required=False, allow_blank=True, default="")


class AcceptAIOutputSerializer(serializers.Serializer):
    pass
