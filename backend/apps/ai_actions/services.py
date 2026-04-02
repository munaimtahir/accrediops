from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.ai_actions.models import GeneratedOutput
from apps.audit.services import log_audit_event, snapshot_instance
from apps.workflow.permissions import ensure_project_owner_access


@transaction.atomic
def create_generated_output(
    *,
    project_indicator,
    actor,
    output_type: str,
    user_instruction: str = "",
) -> GeneratedOutput:
    ensure_project_owner_access(actor, project_indicator)
    snapshot = {
        "project_id": project_indicator.project_id,
        "indicator_code": project_indicator.indicator.code,
        "current_status": project_indicator.current_status,
        "user_instruction": user_instruction,
    }
    content = (
        f"Advisory {output_type.lower()} for {project_indicator.indicator.code}. "
        f"Instruction: {user_instruction or 'No extra instruction provided.'}"
    )
    generated_output = GeneratedOutput.objects.create(
        project_indicator=project_indicator,
        output_type=output_type,
        prompt_context_snapshot=snapshot,
        content=content,
        model_name="manual-placeholder",
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
