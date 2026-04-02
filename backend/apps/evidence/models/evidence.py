from django.core.exceptions import ValidationError
from django.db import models

from apps.masters.choices import (
    EvidenceApprovalStatusChoices,
    EvidenceCompletenessStatusChoices,
    EvidenceSourceTypeChoices,
    EvidenceValidityStatusChoices,
)


class EvidenceItem(models.Model):
    project_indicator = models.ForeignKey(
        "indicators.ProjectIndicator",
        on_delete=models.PROTECT,
        related_name="evidence_items",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    source_type = models.CharField(max_length=20, choices=EvidenceSourceTypeChoices.choices)
    file_or_url = models.CharField(max_length=500, blank=True)
    text_content = models.TextField(blank=True)
    version_no = models.PositiveIntegerField(default=1)
    is_current = models.BooleanField(default=True)
    evidence_date = models.DateField(null=True, blank=True)
    uploaded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_evidence_items",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    validity_status = models.CharField(
        max_length=20,
        choices=EvidenceValidityStatusChoices.choices,
        default=EvidenceValidityStatusChoices.UNKNOWN,
    )
    completeness_status = models.CharField(
        max_length=20,
        choices=EvidenceCompletenessStatusChoices.choices,
        default=EvidenceCompletenessStatusChoices.UNKNOWN,
    )
    approval_status = models.CharField(
        max_length=20,
        choices=EvidenceApprovalStatusChoices.choices,
        default=EvidenceApprovalStatusChoices.PENDING,
    )
    reviewed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_evidence_items",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def clean(self):
        if self.source_type in {
            EvidenceSourceTypeChoices.UPLOAD,
            EvidenceSourceTypeChoices.URL,
            EvidenceSourceTypeChoices.EXTERNAL_REF,
        } and not self.file_or_url:
            raise ValidationError("This evidence source type requires file_or_url.")
        if self.source_type == EvidenceSourceTypeChoices.TEXT_NOTE and not self.text_content:
            raise ValidationError("TEXT_NOTE evidence requires text_content.")

    def __str__(self) -> str:
        return f"{self.project_indicator_id} / {self.title} v{self.version_no}"
