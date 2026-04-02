from django.db import models

from apps.masters.choices import (
    RecurrenceFrequencyChoices,
    RecurrenceModeChoices,
    RecurringInstanceStatusChoices,
)


class RecurringRequirement(models.Model):
    project_indicator = models.OneToOneField(
        "indicators.ProjectIndicator",
        on_delete=models.CASCADE,
        related_name="recurring_requirement",
    )
    frequency = models.CharField(max_length=10, choices=RecurrenceFrequencyChoices.choices)
    mode = models.CharField(max_length=10, choices=RecurrenceModeChoices.choices)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    instructions = models.TextField(blank=True)
    expected_title_template = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return f"{self.project_indicator} / {self.frequency}"


class RecurringEvidenceInstance(models.Model):
    recurring_requirement = models.ForeignKey(
        "recurring.RecurringRequirement",
        on_delete=models.CASCADE,
        related_name="instances",
    )
    due_date = models.DateField()
    period_label = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=RecurringInstanceStatusChoices.choices,
        default=RecurringInstanceStatusChoices.PENDING,
    )
    linked_evidence_item = models.ForeignKey(
        "evidence.EvidenceItem",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recurring_instances",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["due_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["recurring_requirement", "due_date"],
                name="unique_recurring_due_date_per_requirement",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.recurring_requirement_id} / {self.due_date}"
