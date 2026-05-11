from django.db import models

class EvidenceRequirementSuggestion(models.Model):
    framework_indicator = models.ForeignKey(
        "indicators.Indicator",
        on_delete=models.CASCADE,
        related_name="evidence_requirement_suggestions",
    )
    suggested_title = models.CharField(max_length=255)
    suggested_description = models.TextField(blank=True)
    suggested_evidence_category = models.CharField(
        max_length=50,
        blank=True,
    )
    confidence_score = models.FloatField(default=0.0)
    ai_rationale = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_applied = models.BooleanField(default=False)
    applied_at = models.DateTimeField(null=True, blank=True)
    applied_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Suggestion for {self.framework_indicator.code}: {self.suggested_title}"
