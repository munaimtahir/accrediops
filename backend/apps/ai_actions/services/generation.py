"""AI output generation logic."""

import time
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.ai_actions.models import GeneratedOutput
from apps.ai_actions.services.provider import get_ai_config
from apps.ai_actions.services.prompts import (
    build_indicator_ai_context,
    build_prompt_for_output_type,
)
from apps.ai_actions.services.usage import log_ai_usage
from apps.audit.services import log_audit_event, snapshot_instance
from apps.exports.services import replace_variables
from apps.workflow.permissions import ensure_project_owner_access


def _call_gemini_api(prompt: str, model: str, api_key: str) -> str:
    """
    Call Gemini API with the given prompt.
    """
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        ai_model = genai.GenerativeModel(model)
        response = ai_model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise Exception(f"Gemini API call failed: {str(e)}") from e


def _generate_ai_output_content(
    output_type: str,
    project_indicator,
    user_instruction: str = "",
    actor=None,
) -> tuple[str, str, dict]:
    """
    Generate AI output content based on configuration.
    """
    config = get_ai_config()
    indicator_context = build_indicator_ai_context(project_indicator)
    
    try:
        prompt = build_prompt_for_output_type(output_type, indicator_context, user_instruction)
    except ValueError as e:
        prompt = f"[ERROR] {str(e)}"

    if config.demo_mode:
        content = (
            f"[DEMO MODE] Advisory {output_type.lower()} output for {indicator_context.get('indicator_code', 'Unknown')}.\n\n"
            f"Prompt used:\n{prompt[:500]}...\n\n"
            f"This is placeholder output in demo mode. Real AI would process the full prompt."
        )
        return content, "demo-mode", indicator_context

    if config.provider and config.model and not config.api_key:
        error_msg = f"AI provider '{config.provider}' is configured but API key is missing."
        return f"[ERROR] {error_msg}", "error-missing-key", indicator_context

    if not config.is_configured:
        error_msg = "AI provider is not configured. Check environment variables."
        return f"[ERROR] {error_msg}", "error-not-configured", indicator_context

    # Call the appropriate provider
    start_time = time.time()
    feature = f"AI {output_type.capitalize()}"
    indicator_code = indicator_context.get("indicator_code", "")
    project = project_indicator.project
    
    if config.provider == "gemini":
        try:
            content = _call_gemini_api(prompt, config.model, config.api_key)
            log_ai_usage(
                user=actor,
                feature=feature,
                config=config,
                is_success=True,
                duration_ms=int((time.time() - start_time) * 1000),
                project=project,
                indicator_code=indicator_code,
            )
            return content, config.model, indicator_context
        except Exception as e:
            error_msg = f"Gemini API error: {str(e)}"
            log_ai_usage(
                user=actor,
                feature=feature,
                config=config,
                is_success=False,
                error_message=error_msg,
                duration_ms=int((time.time() - start_time) * 1000),
                project=project,
                indicator_code=indicator_code,
            )
            return f"[ERROR] {error_msg}", "gemini-error", indicator_context
    
    return f"[ERROR] Unknown provider: {config.provider}", "error-unknown-provider", indicator_context


@transaction.atomic
def create_generated_output(
    *,
    project_indicator,
    actor,
    output_type: str,
    user_instruction: str = "",
) -> GeneratedOutput:
    """
    Create a generated AI output record.
    """
    ensure_project_owner_access(actor, project_indicator)

    content, model_name, indicator_context = _generate_ai_output_content(
        output_type=output_type,
        project_indicator=project_indicator,
        user_instruction=user_instruction,
        actor=actor,
    )

    project = project_indicator.project
    content = replace_variables(content, project.client_profile)
    generated_output = GeneratedOutput.objects.create(
        project_indicator=project_indicator,
        output_type=output_type,
        prompt_context_snapshot=indicator_context,
        content=content,
        model_name=model_name,
        created_by=actor,
    )
    log_audit_event(
        actor=actor,
        event_type="ai.output_created",
        obj=generated_output,
        before=None,
        after=snapshot_instance(generated_output),
    )
    return generated_output


@transaction.atomic
def accept_generated_output(*, generated_output: GeneratedOutput, actor) -> GeneratedOutput:
    """
    Accept a generated AI output.
    """
    ensure_project_owner_access(actor, generated_output.project_indicator)
    if generated_output.accepted:
        raise ValidationError("Generated output has already been accepted.")
    before = snapshot_instance(generated_output)
    generated_output.accepted = True
    generated_output.accepted_at = timezone.now()
    generated_output.accepted_by = actor
    generated_output.save()
    log_audit_event(
        actor=actor,
        event_type="ai.output_accepted",
        obj=generated_output,
        before=before,
        after=snapshot_instance(generated_output),
    )
    return generated_output
