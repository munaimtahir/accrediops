from django.core.exceptions import ValidationError
from django.db import models

from apps.masters.choices import (
    DocumentTypeChoices,
    EvidenceReusePolicyChoices,
    EvidenceTypeChoices,
    IndicatorCommentTypeChoices,
    PriorityChoices,
    ProjectIndicatorStatusChoices,
    RecurrenceFrequencyChoices,
    RecurrenceModeChoices,
)
from apps.workflow.guards import workflow_transition_is_allowed


class Indicator(models.Model):
    framework = models.ForeignKey(
        "frameworks.Framework",
        on_delete=models.PROTECT,
        related_name="indicators",
    )
    area = models.ForeignKey(
        "frameworks.Area",
        on_delete=models.PROTECT,
        related_name="indicators",
    )
    standard = models.ForeignKey(
        "frameworks.Standard",
        on_delete=models.PROTECT,
        related_name="indicators",
    )
    code = models.CharField(max_length=100)
    text = models.TextField()
    required_evidence_description = models.TextField(blank=True)
    evidence_type = models.CharField(
        max_length=20,
        choices=EvidenceTypeChoices.choices,
        default=EvidenceTypeChoices.DOCUMENT,
    )
    document_type = models.CharField(
        max_length=20,
        choices=DocumentTypeChoices.choices,
        default=DocumentTypeChoices.OTHER,
    )
    fulfillment_guidance = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=False)
    recurrence_frequency = models.CharField(
        max_length=10,
        choices=RecurrenceFrequencyChoices.choices,
        default=RecurrenceFrequencyChoices.NONE,
    )
    recurrence_mode = models.CharField(
        max_length=10,
        choices=RecurrenceModeChoices.choices,
        default=RecurrenceModeChoices.EITHER,
    )
    minimum_required_evidence_count = models.PositiveIntegerField(default=1)
    reusable_template_allowed = models.BooleanField(default=False)
    evidence_reuse_policy = models.CharField(
        max_length=20,
        choices=EvidenceReusePolicyChoices.choices,
        default=EvidenceReusePolicyChoices.NONE,
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["area__sort_order", "standard__sort_order", "sort_order", "code"]
        constraints = [
            models.UniqueConstraint(fields=["framework", "code"], name="unique_indicator_code_per_framework"),
        ]

    def clean(self):
        if self.area_id and self.framework_id and self.area.framework_id != self.framework_id:
            raise ValidationError("Indicator area must belong to the same framework.")
        if self.standard_id and self.framework_id and self.standard.framework_id != self.framework_id:
            raise ValidationError("Indicator standard must belong to the same framework.")
        if self.standard_id and self.area_id and self.standard.area_id != self.area_id:
            raise ValidationError("Indicator standard must belong to the selected area.")
        if not self.is_recurring and self.recurrence_frequency != RecurrenceFrequencyChoices.NONE:
            raise ValidationError("Non-recurring indicators must use recurrence frequency NONE.")
        if self.is_recurring and self.recurrence_frequency == RecurrenceFrequencyChoices.NONE:
            raise ValidationError("Recurring indicators must define a recurrence frequency.")

    def __str__(self) -> str:
        return self.code


class ProjectIndicator(models.Model):
    project = models.ForeignKey(
        "projects.AccreditationProject",
        on_delete=models.CASCADE,
        related_name="project_indicators",
    )
    indicator = models.ForeignKey(
        "indicators.Indicator",
        on_delete=models.CASCADE,
        related_name="project_indicators",
    )
    current_status = models.CharField(
        max_length=20,
        choices=ProjectIndicatorStatusChoices.choices,
        default=ProjectIndicatorStatusChoices.NOT_STARTED,
    )
    is_finalized = models.BooleanField(default=False)
    is_met = models.BooleanField(default=False)
    owner = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_project_indicators",
    )
    reviewer = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="review_project_indicators",
    )
    approver = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approve_project_indicators",
    )
    priority = models.CharField(
        max_length=20,
        choices=PriorityChoices.choices,
        default=PriorityChoices.MEDIUM,
    )
    due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    last_updated_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_project_indicators",
    )
    last_updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["project__name", "indicator__area__sort_order", "indicator__sort_order", "indicator__code"]
        constraints = [
            models.UniqueConstraint(fields=["project", "indicator"], name="unique_project_indicator"),
        ]

    def save(self, *args, **kwargs):
        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).values(
                "current_status",
                "is_finalized",
                "is_met",
            ).first()
            if previous and not workflow_transition_is_allowed():
                if previous["current_status"] != self.current_status:
                    raise ValidationError("Project indicator status changes must go through the service layer.")
                if previous["is_finalized"] != self.is_finalized or previous["is_met"] != self.is_met:
                    raise ValidationError("Project indicator workflow flags must go through the service layer.")
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.project.name} / {self.indicator.code}"


class ProjectIndicatorComment(models.Model):
    project_indicator = models.ForeignKey(
        "indicators.ProjectIndicator",
        on_delete=models.CASCADE,
        related_name="comments",
    )
    type = models.CharField(max_length=20, choices=IndicatorCommentTypeChoices.choices)
    text = models.TextField()
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="project_indicator_comments",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.project_indicator_id} / {self.type}"


class ProjectIndicatorStatusHistory(models.Model):
    project_indicator = models.ForeignKey(
        "indicators.ProjectIndicator",
        on_delete=models.CASCADE,
        related_name="status_history",
    )
    from_status = models.CharField(max_length=20, choices=ProjectIndicatorStatusChoices.choices)
    to_status = models.CharField(max_length=20, choices=ProjectIndicatorStatusChoices.choices)
    action = models.CharField(max_length=50)
    reason = models.TextField(blank=True)
    actor = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="project_indicator_status_changes",
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"{self.project_indicator_id}: {self.from_status} -> {self.to_status}"
