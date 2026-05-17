from rest_framework import serializers
from apps.indicators.models.capa import Gap, CAPA
from django.utils import timezone
from apps.masters.choices import PriorityChoices, CapaStatusChoices

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
    gap_severity = serializers.CharField(source="gap.severity", read_only=True)
    responsible_person_username = serializers.CharField(source="responsible_person.username", read_only=True, allow_null=True)
    evidence_requirement_title = serializers.SerializerMethodField()
    is_mandatory_evidence = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    is_export_blocker = serializers.SerializerMethodField()

    class Meta:
        model = CAPA
        fields = "__all__"

    def get_evidence_requirement_title(self, obj: CAPA):
        req = getattr(obj, "project_evidence_requirement", None)
        if not req:
            return None
        ev = getattr(req, "evidence_requirement", None)
        return getattr(ev, "title", None)

    def get_is_mandatory_evidence(self, obj: CAPA) -> bool:
        req = getattr(obj, "project_evidence_requirement", None)
        if not req:
            return False
        ev = getattr(req, "evidence_requirement", None)
        return bool(getattr(ev, "mandatory", False))

    def get_is_overdue(self, obj: CAPA) -> bool:
        if not obj.due_date:
            return False
        if obj.status not in {CapaStatusChoices.OPEN, CapaStatusChoices.IN_PROGRESS, CapaStatusChoices.SUBMITTED_FOR_REVIEW, CapaStatusChoices.REJECTED}:
            return False
        return obj.due_date < timezone.localdate()

    def get_is_export_blocker(self, obj: CAPA) -> bool:
        # Matches readiness criteria: mandatory evidence OR high severity gap.
        return self.get_is_mandatory_evidence(obj) or (getattr(obj.gap, "severity", None) in {PriorityChoices.HIGH, PriorityChoices.CRITICAL})

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
    in_progress_capa_count = serializers.IntegerField()
    submitted_capa_count = serializers.IntegerField()
    closed_capa_count = serializers.IntegerField()
    rejected_capa_count = serializers.IntegerField()
    cancelled_capa_count = serializers.IntegerField()
    high_risk_capa_count = serializers.IntegerField()
    overdue_capa_count = serializers.IntegerField()
    export_blocker_count = serializers.IntegerField()
    assigned_to_me_count = serializers.IntegerField(required=False)
