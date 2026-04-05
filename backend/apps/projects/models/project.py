from django.conf import settings
from django.db import models

from apps.masters.choices import ProjectStatusChoices


class AccreditationProject(models.Model):
    name = models.CharField(max_length=255)
    client_name = models.CharField(max_length=255)
    accrediting_body_name = models.CharField(max_length=255)
    framework = models.ForeignKey(
        "frameworks.Framework",
        on_delete=models.PROTECT,
        related_name="projects",
    )
    status = models.CharField(
        max_length=20,
        choices=ProjectStatusChoices.choices,
        default=ProjectStatusChoices.DRAFT,
    )
    start_date = models.DateField()
    target_date = models.DateField()
    notes = models.TextField(blank=True)
    client_profile = models.ForeignKey(
        "accounts.ClientProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "name"]

    def __str__(self) -> str:
        return self.name
