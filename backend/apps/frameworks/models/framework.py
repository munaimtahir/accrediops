from django.core.exceptions import ValidationError
from django.db import models


class Framework(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Area(models.Model):
    framework = models.ForeignKey(
        "frameworks.Framework",
        on_delete=models.CASCADE,
        related_name="areas",
    )
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["framework__name", "sort_order", "code"]
        constraints = [
            models.UniqueConstraint(fields=["framework", "code"], name="unique_area_code_per_framework"),
        ]

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"


class Standard(models.Model):
    framework = models.ForeignKey(
        "frameworks.Framework",
        on_delete=models.CASCADE,
        related_name="standards",
    )
    area = models.ForeignKey(
        "frameworks.Area",
        on_delete=models.CASCADE,
        related_name="standards",
    )
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["framework__name", "area__sort_order", "sort_order", "code"]
        constraints = [
            models.UniqueConstraint(fields=["framework", "code"], name="unique_standard_code_per_framework"),
        ]

    def clean(self):
        if self.area_id and self.framework_id and self.area.framework_id != self.framework_id:
            raise ValidationError("Standard area must belong to the same framework.")

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"
