import time
from django.utils import timezone
from apps.ai_actions.models import AIUsageLog

def log_ai_usage(
    *,
    user,
    feature,
    config,
    is_success=True,
    error_message="",
    duration_ms=None,
    tokens_used=None,
    framework=None,
    project=None,
    indicator_code="",
    metadata=None,
):
    """
    Log an AI interaction to the database.
    """
    return AIUsageLog.objects.create(
        user=user,
        feature=feature,
        provider=config.provider or "unknown",
        model=config.model or "unknown",
        is_demo_mode=config.demo_mode,
        is_success=is_success,
        error_message=error_message,
        request_duration_ms=duration_ms,
        tokens_used=tokens_used,
        framework=framework,
        project=project,
        indicator_code=indicator_code,
        metadata=metadata or {},
    )
