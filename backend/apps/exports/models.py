from django.db import models

from apps.exports.models_admin import ExportJob, ImportLog  # noqa: F401


class PrintPackItem(models.Model):
    project_indicator = models.ForeignKey(
        "indicators.ProjectIndicator",
        on_delete=models.CASCADE,
        related_name="print_pack_items",
    )
    evidence_item = models.ForeignKey(
        "evidence.EvidenceItem",
        on_delete=models.CASCADE,
        related_name="print_pack_items",
    )
    order = models.PositiveIntegerField(default=0)
    section_name = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"{self.project_indicator_id}:{self.evidence_item_id}"
