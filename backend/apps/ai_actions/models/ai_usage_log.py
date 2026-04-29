from django.conf import settings
from django.db import models


class AIUsageLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="ai_usage_logs",
    )
    feature = models.CharField(max_length=50)  # e.g., AI Assist, AI Classification
    provider = models.CharField(max_length=50)
    model = models.CharField(max_length=100)
    is_demo_mode = models.BooleanField(default=False)
    
    # Context
    framework = models.ForeignKey(
        "frameworks.Framework",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    project = models.ForeignKey(
        "projects.AccreditationProject",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    indicator_code = models.CharField(max_length=50, blank=True)
    
    # Result
    is_success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    request_duration_ms = models.PositiveIntegerField(null=True, blank=True)
    tokens_used = models.PositiveIntegerField(null=True, blank=True)
    
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "AI Usage Log"
        verbose_name_plural = "AI Usage Logs"

    def __str__(self) -> str:
        return f"{self.timestamp} - {self.user} - {self.feature}"
