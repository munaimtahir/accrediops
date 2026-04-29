"""
AI Provider Configuration and Validation

Supports multiple AI providers (Gemini, OpenAI, Anthropic).
Provides clear error messages when providers are not configured.
Allows demo mode for development/testing without real API keys.
"""

from typing import NamedTuple

from django.conf import settings


class AIConfiguration(NamedTuple):
    """AI configuration state."""

    provider: str  # "gemini", "openai", "anthropic"
    model: str  # e.g., "gemini-1.5-flash", "gpt-4", "claude-3-sonnet"
    api_key: str | None  # Provider API key
    demo_mode: bool  # True = return demo output without calling provider
    is_configured: bool  # True if provider and api_key are both set


class AIConfigurationError(Exception):
    """Raised when AI provider is not properly configured."""

    pass


def get_ai_config() -> AIConfiguration:
    """
    Read and validate AI configuration from Django settings.

    Returns:
        AIConfiguration with provider, model, api_key, demo_mode, and is_configured state.

    Raises:
        AIConfigurationError: If provider is required but not configured.
    """
    provider = getattr(settings, "AI_PROVIDER", "").strip().lower()
    model = getattr(settings, "AI_MODEL", "").strip()
    demo_mode = getattr(settings, "AI_DEMO_MODE", False)

    api_key = None
    if provider == "gemini":
        api_key = getattr(settings, "GEMINI_API_KEY", "").strip()
    elif provider == "openai":
        api_key = getattr(settings, "OPENAI_API_KEY", "").strip()
    elif provider == "anthropic":
        api_key = getattr(settings, "ANTHROPIC_API_KEY", "").strip()

    is_configured = bool(provider) and bool(model) and bool(api_key)

    return AIConfiguration(
        provider=provider,
        model=model,
        api_key=api_key,
        demo_mode=demo_mode,
        is_configured=is_configured,
    )


def validate_ai_config() -> None:
    """
    Validate AI configuration.

    If provider is required (AI_DEMO_MODE=false), raises clear error if not configured.
    If demo mode is enabled, no validation is performed.

    Raises:
        AIConfigurationError: If provider is required but not configured.
    """
    config = get_ai_config()

    if config.demo_mode:
        return

    if not config.provider or not config.model:
        raise AIConfigurationError(
            "AI provider is not configured. "
            "Please set AI_PROVIDER and AI_MODEL environment variables. "
            "Supported providers: gemini, openai, anthropic."
        )

    if not config.api_key:
        provider_key_map = {
            "gemini": "GEMINI_API_KEY",
            "openai": "OPENAI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
        }
        key_name = provider_key_map.get(config.provider, f"{config.provider.upper()}_API_KEY")
        raise AIConfigurationError(
            f"AI provider is not configured with an API key. "
            f"Please set {key_name} environment variable."
        )
