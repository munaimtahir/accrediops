from django.db import models


class MasterValue(models.Model):
    key = models.CharField(max_length=100)
    code = models.CharField(max_length=100)
    label = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key", "sort_order", "code"]
        constraints = [
            models.UniqueConstraint(fields=["key", "code"], name="unique_master_key_code"),
        ]

    def __str__(self) -> str:
        return f"{self.key}:{self.code}"
