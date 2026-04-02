from django.conf import settings
from django.db import models

from apps.masters.choices import GeneratedOutputTypeChoices


class GeneratedOutput(models.Model):
    project_indicator = models.ForeignKey(
        "indicators.ProjectIndicator",
        on_delete=models.CASCADE,
        related_name="generated_outputs",
    )
    output_type = models.CharField(max_length=20, choices=GeneratedOutputTypeChoices.choices)
    prompt_context_snapshot = models.JSONField(default=dict, blank=True)
    content = models.TextField()
    model_name = models.CharField(max_length=100)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="generated_outputs",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accepted_generated_outputs",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.project_indicator_id} / {self.output_type}"
