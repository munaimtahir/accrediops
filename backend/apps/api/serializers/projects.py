from rest_framework import serializers

from apps.masters.choices import ProjectStatusChoices
from apps.projects.models import AccreditationProject
from apps.projects.services import project_summary_counts


class ProjectSerializer(serializers.ModelSerializer):
    total_indicators = serializers.SerializerMethodField()
    met_indicators = serializers.SerializerMethodField()
    pending_indicators = serializers.SerializerMethodField()
    recurring_due_today = serializers.SerializerMethodField()
    overdue_recurring_items = serializers.SerializerMethodField()

    class Meta:
        model = AccreditationProject
        fields = (
            "id",
            "name",
            "client_name",
            "accrediting_body_name",
            "framework",
            "status",
            "start_date",
            "target_date",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
            "total_indicators",
            "met_indicators",
            "pending_indicators",
            "recurring_due_today",
            "overdue_recurring_items",
        )

    def _counts(self, obj):
        return project_summary_counts(obj)

    def get_total_indicators(self, obj):
        return self._counts(obj)["total_indicators"]

    def get_met_indicators(self, obj):
        return self._counts(obj)["met_indicators"]

    def get_pending_indicators(self, obj):
        return self._counts(obj)["pending_indicators"]

    def get_recurring_due_today(self, obj):
        return self._counts(obj)["recurring_due_today"]

    def get_overdue_recurring_items(self, obj):
        return self._counts(obj)["overdue_recurring_items"]


class ProjectDetailSerializer(ProjectSerializer):
    pass


class ProjectWriteSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=ProjectStatusChoices.choices, required=False)

    class Meta:
        model = AccreditationProject
        fields = (
            "name",
            "client_name",
            "accrediting_body_name",
            "framework",
            "status",
            "start_date",
            "target_date",
            "notes",
        )


class InitializeProjectSerializer(serializers.Serializer):
    create_initial_instances = serializers.BooleanField(required=False, default=True)


class StandardsProgressSerializer(serializers.Serializer):
    area_id = serializers.IntegerField(source="indicator__area_id")
    area_code = serializers.CharField(source="indicator__area__code")
    area_name = serializers.CharField(source="indicator__area__name")
    standard_id = serializers.IntegerField(source="indicator__standard_id")
    standard_code = serializers.CharField(source="indicator__standard__code")
    standard_name = serializers.CharField(source="indicator__standard__name")
    total_indicators = serializers.IntegerField()
    met_indicators = serializers.IntegerField()
    blocked_count = serializers.IntegerField()
    in_review_count = serializers.IntegerField()
    progress_percent = serializers.FloatField()


class AreasProgressSerializer(serializers.Serializer):
    area_id = serializers.IntegerField()
    area_code = serializers.CharField()
    area_name = serializers.CharField()
    total_standards = serializers.IntegerField()
    completed_standards = serializers.IntegerField()
    progress_percent = serializers.FloatField()
