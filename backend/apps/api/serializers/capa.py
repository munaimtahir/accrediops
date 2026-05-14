from rest_framework import serializers
from apps.indicators.models.capa import Gap, CAPA

class GapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gap
        fields = "__all__"

class GapCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gap
        fields = ["title", "description", "severity"]

class CAPASerializer(serializers.ModelSerializer):
    gap_title = serializers.CharField(source="gap.title", read_only=True)
    indicator_code = serializers.CharField(source="project_indicator.indicator.code", read_only=True)

    class Meta:
        model = CAPA
        fields = "__all__"

class CAPACreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CAPA
        fields = ["title", "root_cause", "corrective_action", "preventive_action", "responsible_person", "due_date"]

class CAPAUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CAPA
        fields = ["title", "root_cause", "corrective_action", "preventive_action", "responsible_person", "due_date"]

class CAPAActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["SUBMIT", "CLOSE", "REJECT"])
    closure_notes = serializers.CharField(required=False, allow_blank=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    closure_evidence_id = serializers.IntegerField(required=False, allow_null=True)

class CAPASummarySerializer(serializers.Serializer):
    total_capa = serializers.IntegerField()
    open_capa_count = serializers.IntegerField()
    submitted_capa_count = serializers.IntegerField()
    closed_capa_count = serializers.IntegerField()
    high_risk_capa_count = serializers.IntegerField()
    overdue_capa_count = serializers.IntegerField()
