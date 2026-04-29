from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.ai_actions.models import DocumentDraft
from apps.ai_actions.services.generation import _call_gemini_api
from apps.ai_actions.services.provider import get_ai_config
from apps.ai_actions.services.usage import log_ai_usage
from apps.accounts.models import User
from apps.frameworks.models import Framework
from apps.indicators.models import Indicator, ProjectIndicator
from apps.projects.models import AccreditationProject
from apps.masters.choices import DocumentTypeChoices
from apps.evidence.models import EvidenceItem
from apps.audit.services import log_audit_event, snapshot_instance


# Disclaimer to be included in all AI-generated drafts
AI_DRAFT_DISCLAIMER = (
    "---AI Advisory Disclaimer---\n"
    "This is an AI-assisted draft and requires human review before use as accreditation evidence. "
    "It may contain inaccuracies or omissions. Verify all content against official policies and client context. "
    "This draft does not claim evidence exists or that the indicator is compliant. "
    "Client-specific placeholders (e.g., [Institution Name]) must be replaced manually.\n"
    "---End Disclaimer---\n\n"
)


def _build_document_draft_prompt(
    framework: Framework,
    indicator: Indicator,
    project: AccreditationProject = None,
    client_profile: dict = None,
    user_instruction: str = "",
) -> str:
    """
    Builds a detailed prompt for generating a document draft based on the indicator context.
    """
    context = {
        "framework_name": framework.name,
        "indicator_code": indicator.code,
        "indicator_text": indicator.text,
        "required_evidence_description": indicator.required_evidence_description,
        "fulfillment_guidance": indicator.fulfillment_guidance,
        "evidence_type": indicator.get_evidence_type_display(),
        "document_type": indicator.get_document_type_display(),
        "primary_action_required": indicator.get_primary_action_required_display(),
        "ai_assistance_level": indicator.get_ai_assistance_level_display(),
        "classification_confidence": indicator.get_classification_confidence_display(),
    }

    if project and client_profile:
        context["project_name"] = project.name
        context["client_name"] = client_profile.get("organization_name", "[Institution Name]")
        context["client_address"] = client_profile.get("address", "[Institution Address]")
        context["contact_person"] = client_profile.get("contact_person", "[Responsible Person]")
        context["accreditation_cycle"] = project.accrediting_body_name # Re-using this field for cycle context

    prompt_parts = [
        "You are an expert accreditation document writer. Your task is to draft an accreditation document "
        "based on the provided indicator requirements and context.",
        "Produce a practical, clear, and concise draft for an accreditation policy or procedure. "
        "Do not claim evidence exists, state compliance, or invent licenses/dates/approvals.",
        "Clearly mark any missing client-specific details as bracketed placeholders, e.g., [Institution Name].",
        "Framework Details:",
        f"- Framework: {context['framework_name']}",
        f"- Indicator Code: {context['indicator_code']}",
        f"- Indicator Requirement: {context['indicator_text']}",
        f"- Required Evidence: {context['required_evidence_description']}",
        f"- Document Type: {context['document_type']} (draft a document of this type)",
        f"- Primary Action: {context['primary_action_required']}",
        f"- Fulfillment Guidance: {context['fulfillment_guidance']}",
        f"- AI Assistance Level: {context['ai_assistance_level']} (use this for tone/detail guidance)",
    ]

    if project and client_profile:
        prompt_parts.extend([
            "\nProject and Client Context (incorporate these details where appropriate, using placeholders for missing data):",
            f"- Project Name: {context['project_name']}",
            f"- Client/Institution Name: {context['client_name']}",
            f"- Client Address: {context['client_address']}",
            f"- Contact Person: {context['contact_person']}",
            f"- Accreditation Cycle: {context['accreditation_cycle']}",
        ])

    prompt_parts.append(f"\nUser specific instructions: {user_instruction}\n")

    prompt_parts.append("\nSuggested structure for the draft (adapt as appropriate for document type):\n")
    if indicator.document_type == DocumentTypeChoices.POLICY:
        prompt_parts.extend([
            "Title: [Document Title] - [Indicator Code]",
            "1. Purpose:",
            "2. Scope:",
            "3. Policy Statement:",
            "4. Responsibilities:",
            "5. Definitions (if any):",
            "6. Procedures (high-level):",
            "7. Records and Forms:",
            "8. Monitoring and Review:",
            "9. Version Control:",
            "[Effective Date]:",
            "[Review Date]:",
            "[Approval Authority]:",
        ])
    elif indicator.document_type == DocumentTypeChoices.PROCEDURE:
        prompt_parts.extend([
            "Title: [Document Title] - [Indicator Code]",
            "1. Purpose:",
            "2. Scope:",
            "3. Definitions (if any):",
            "4. Procedure Steps (detailed, numbered):",
            "5. Responsibilities:",
            "6. Records:",
            "7. Related Documents:",
            "[Effective Date]:",
            "[Review Date]:",
            "[Approval Authority]:",
        ])
    else: # General document / Other
        prompt_parts.extend([
            "Title: [Document Title] - [Indicator Code]",
            "1. Introduction:",
            "2. Overview:",
            "3. Main Content:",
            "4. Conclusion:",
            "[Relevant Dates]:",
            "[Signatures/Approvals]:",
        ])

    return "\n".join(prompt_parts)


@transaction.atomic
def generate_document_draft(
    *,
    actor: User,
    framework: Framework,
    indicator: Indicator,
    project: AccreditationProject = None,
    project_indicator: ProjectIndicator = None,
    user_instruction: str = "",
    document_type_override: str = None,
    overwrite_existing_draft: bool = False,
    parent_draft: DocumentDraft = None,
) -> DocumentDraft:
    """
    Generates an AI-assisted document draft.
    """
    if project and not project_indicator:
        raise ValidationError("If a project is provided, project_indicator must also be provided.")
    if project_indicator and not project:
        raise ValidationError("If a project_indicator is provided, the project must also be provided.")
    if project and project_indicator and (
        project != project_indicator.project
        or framework != project_indicator.indicator.framework
        or indicator != project_indicator.indicator
    ):
        raise ValidationError("Project/ProjectIndicator/Framework/Indicator mismatch.")

    config = get_ai_config()
    client_profile = project.client_profile.get_data() if project and project.client_profile else {}
    
    # Build prompt
    prompt = _build_document_draft_prompt(
        framework=framework,
        indicator=indicator,
        project=project,
        client_profile=client_profile,
        user_instruction=user_instruction,
    )
    
    draft_title_prefix = f"Draft for {indicator.code}"
    
    # Handle demo mode
    if config.demo_mode:
        content = (
            f"[DEMO MODE] Advisory document draft for {indicator.code}.\n\n"
            f"Prompt used:\n{prompt[:500]}...\n\n"
            f"This is placeholder output in demo mode. Real AI would process the full prompt.\n\n"
            f"{AI_DRAFT_DISCLAIMER}"
        )
        draft_title = f"{draft_title_prefix} (DEMO)"
        model_name = "demo-mode"
        ai_usage_log = log_ai_usage(
            user=actor,
            feature="Document Drafting",
            config=config,
            is_success=True,
            framework=framework,
            project=project,
            indicator_code=indicator.code,
        )
        return DocumentDraft.objects.create(
            framework=framework,
            indicator=indicator,
            project=project,
            project_indicator=project_indicator,
            title=draft_title,
            document_type=document_type_override or indicator.document_type,
            draft_content=content,
            prompt_snapshot={"prompt": prompt},
            source="AI",
            provider=config.provider,
            model=model_name,
            ai_usage_log=ai_usage_log,
            generated_by=actor,
            version=1, # Demo drafts are always version 1
        )

    # Handle actual AI call
    start_time = time.time()
    feature = "Document Drafting"
    
    try:
        if config.provider == "gemini":
            ai_content = _call_gemini_api(prompt, config.model, config.api_key)
            model_name = config.model
        else:
            raise ValidationError(f"Unknown AI provider: {config.provider}")

        full_content = f"{ai_content}\n\n{AI_DRAFT_DISCLAIMER}"
        draft_title = f"{draft_title_prefix} - {timezone.now().strftime('%Y-%m-%d %H:%M')}"
        
        ai_usage_log = log_ai_usage(
            user=actor,
            feature=feature,
            config=config,
            is_success=True,
            duration_ms=int((time.time() - start_time) * 1000),
            framework=framework,
            project=project,
            indicator_code=indicator.code,
            metadata={"document_type": document_type_override or indicator.document_type},
        )
        
        # Determine version
        version = 1
        if parent_draft:
            version = parent_draft.version + 1
        else:
            latest_draft = DocumentDraft.objects.filter(
                framework=framework,
                indicator=indicator,
                project=project,
                project_indicator=project_indicator,
                parent_draft__isnull=True, # Only consider top-level drafts for versioning
            ).order_by('-version').first()
            if latest_draft and not overwrite_existing_draft:
                version = latest_draft.version + 1
            elif latest_draft and overwrite_existing_draft:
                version = latest_draft.version # Keep the same version if overwriting

        return DocumentDraft.objects.create(
            framework=framework,
            indicator=indicator,
            project=project,
            project_indicator=project_indicator,
            title=draft_title,
            document_type=document_type_override or indicator.document_type,
            draft_content=full_content,
            prompt_snapshot={"prompt": prompt},
            source="AI",
            provider=config.provider,
            model=model_name,
            ai_usage_log=ai_usage_log,
            generated_by=actor,
            version=version,
            parent_draft=parent_draft,
        )

    except Exception as e:
        error_msg = f"AI document drafting failed: {str(e)}"
        log_ai_usage(
            user=actor,
            feature=feature,
            config=config,
            is_success=False,
            error_message=error_msg,
            duration_ms=int((time.time() - start_time) * 1000),
            framework=framework,
            project=project,
            indicator_code=indicator.code,
            metadata={"document_type": document_type_override or indicator.document_type},
        )
        raise ValidationError(error_msg)


@transaction.atomic
def promote_draft_to_evidence(
    *,
    actor: User,
    document_draft: DocumentDraft,
    project: AccreditationProject,
    project_indicator: ProjectIndicator,
    evidence_title: str,
    evidence_type: str,
    document_type: str,
    final_filename: str = "",
    notes: str = "",
) -> DocumentDraft:
    """
    Promotes a document draft to project evidence.
    """
    if document_draft.review_status == "PROMOTED_TO_EVIDENCE":
        raise ValidationError("This draft has already been promoted to evidence.")

    # Ensure draft is linked to the correct project/indicator for promotion
    if document_draft.project != project or document_draft.project_indicator != project_indicator:
        # If it's a framework-level draft, it must be adapted for project
        if document_draft.project is None:
            # Re-link framework-level draft to project, create new version if needed
            document_draft.project = project
            document_draft.project_indicator = project_indicator
            document_draft.save() # Save the re-linking
        else:
            raise ValidationError("Draft project/project indicator mismatch for promotion.")

    # Create the EvidenceItem
    evidence_item = EvidenceItem.objects.create(
        project_indicator=project_indicator,
        title=evidence_title,
        description=document_draft.draft_content, # Draft content becomes evidence description
        source_type="GENERATED", # Mark as AI-generated/promoted
        text_content=document_draft.draft_content,
        document_type=document_type,
        file_label=final_filename,
        uploaded_by=actor,
        notes=notes,
        evidence_type=evidence_type,
        approval_status="PENDING", # Always pending, requires human approval
    )

    # Update the document draft status
    document_draft.review_status = "PROMOTED_TO_EVIDENCE"
    document_draft.promoted_by = actor
    document_draft.promoted_at = timezone.now()
    document_draft.promoted_evidence = evidence_item
    document_draft.save()

    # Log the action
    log_audit_event(
        actor=actor,
        event_type="document_draft.promoted_to_evidence",
        obj=document_draft,
        after=snapshot_instance(document_draft),
        notes=f"Promoted to EvidenceItem ID: {evidence_item.id}",
    )

    return document_draft
