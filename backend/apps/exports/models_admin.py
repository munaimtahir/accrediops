from django.db import models


class ExportJob(models.Model):
    project = models.ForeignKey(
        "projects.AccreditationProject",
        on_delete=models.CASCADE,
        related_name="export_jobs",
    )
    type = models.CharField(max_length=50)
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="export_jobs",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, default="PENDING")
    file_name = models.CharField(max_length=255, blank=True)
    parameters = models.JSONField(default=dict, blank=True)
    warnings = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.project_id}:{self.type}:{self.status}"


class ImportLog(models.Model):
    file_name = models.CharField(max_length=255)
    rows_processed = models.PositiveIntegerField(default=0)
    errors = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.file_name


__all__ = ["ExportJob", "ImportLog"]
