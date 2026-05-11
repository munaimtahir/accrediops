import time
from dataclasses import dataclass

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.ai_actions.models import DocumentDraft
from apps.ai_actions.models.document_draft import DocumentDraftKindChoices
from apps.ai_actions.services import generation
from apps.ai_actions.services.provider import AIConfigurationError, get_ai_config, validate_ai_config
from apps.ai_actions.services.usage import log_ai_usage
from apps.frameworks.models import Framework
from apps.indicators.models import Indicator
from apps.masters.choices import DocumentTypeChoices


AI_DRAFT_DISCLAIMER = (
    "---AI Advisory Disclaimer---\n"
    "This is an AI-assisted draft and requires human review before use as accreditation evidence. "
    "It may contain inaccuracies or omissions. Verify all content against official policies and client context. "
    "This draft does not claim evidence exists or that the indicator(s) are compliant.\n"
    "---End Disclaimer---\n\n"
)


class DocumentationScopeChoices:
    SINGLE = "single_indicator"
    SELECTED = "selected_indicators"
    AREA = "area"
    STANDARD = "standard"
    FRAMEWORK = "framework"


@dataclass(frozen=True)
class DocumentationScope:
    scope: str
    indicator_ids: list[int]


def _document_type_for_kind(kind: str) -> str:
    if kind == DocumentDraftKindChoices.SOP:
        return DocumentTypeChoices.SOP
    if kind == DocumentDraftKindChoices.POLICY:
        return DocumentTypeChoices.POLICY
    return DocumentTypeChoices.OTHER


def _build_framework_prompt(
    *,
    framework: Framework,
    indicators: list[Indicator],
    kind: str,
    user_instruction: str,
) -> str:
    indicator_lines = []
    for indicator in indicators:
        indicator_lines.append(
            "\n".join(
                [
                    f"- Code: {indicator.code}",
                    f"  Requirement: {indicator.text}",
                    f"  Required evidence: {indicator.required_evidence_description}",
                    f"  Evidence type: {indicator.get_evidence_type_display()}",
                    f"  Suggested document type: {indicator.get_document_type_display()}",
                ]
            )
        )

    template_by_kind = {
        DocumentDraftKindChoices.SOP: [
            "Title",
            "Purpose",
            "Scope",
            "Responsibility",
            "Procedure",
            "Records/evidence",
            "Review frequency",
            "Related indicators",
            "Approval section",
        ],
        DocumentDraftKindChoices.POLICY: [
            "Title",
            "Policy statement",
            "Scope",
            "Responsibility",
            "Implementation requirements",
            "Monitoring",
            "Related indicators",
            "Approval section",
        ],
        DocumentDraftKindChoices.CHECKLIST: [
            "Title",
            "Related indicator(s)",
            "Checklist items",
            "Frequency",
            "Responsible person",
            "Remarks/signature fields",
        ],
        DocumentDraftKindChoices.REGISTER_TEMPLATE: [
            "Title",
            "Columns",
            "Frequency",
            "Responsible person",
            "Retention requirement",
        ],
        DocumentDraftKindChoices.EVIDENCE_REQUIREMENT_SHEET: [
            "Indicator",
            "Required evidence",
            "Evidence type",
            "Current gap",
            "Document needed",
            "Suggested filename",
            "Responsible role",
            "Readiness status",
        ],
        DocumentDraftKindChoices.GAP_CLOSURE_PLAN: [
            "Current gap",
            "Action required",
            "Priority",
            "Responsible person",
            "Suggested evidence",
            "Review checkpoint",
        ],
    }
    template = template_by_kind.get(kind, template_by_kind[DocumentDraftKindChoices.POLICY])
    template_text = "\n".join([f"- {line}" for line in template])

    return "\n".join(
        [
            "You are an expert accreditation documentation writer.",
            "Generate a practical draft document based on the framework indicator requirements provided.",
            "Do NOT claim compliance. Do NOT claim evidence exists. Use placeholders for missing org details.",
            f"Framework: {framework.name}",
            "",
            "Indicators in scope:",
            "\n\n".join(indicator_lines) if indicator_lines else "- (none)",
            "",
            f"Requested output kind: {kind}",
            "Use this structure:",
            template_text,
            "",
            f"User instructions (optional): {user_instruction}",
        ]
    )


def _demo_content(*, framework: Framework, indicators: list[Indicator], kind: str) -> str:
    codes = ", ".join([indicator.code for indicator in indicators]) or "(none)"
    header = f"[DEMO MODE] {kind} draft for framework '{framework.name}' (indicators: {codes})"
    if kind == DocumentDraftKindChoices.EVIDENCE_REQUIREMENT_SHEET:
        rows = []
        for indicator in indicators:
            rows.append(
                f"- {indicator.code}: evidence={indicator.required_evidence_description or '(not specified)'}; "
                f"type={indicator.evidence_type}; doc={indicator.document_type}"
            )
        body = "Evidence requirement sheet (draft rows):\n" + "\n".join(rows)
    elif kind == DocumentDraftKindChoices.GAP_CLOSURE_PLAN:
        body = (
            "Gap closure plan (draft):\n"
            "- Current gap: [Describe]\n"
            "- Action required: [Describe]\n"
            "- Priority: [High/Med/Low]\n"
            "- Suggested evidence: [Describe]\n"
            "- Review checkpoint: [Describe]\n"
        )
    else:
        body = "Draft outline:\n" + "\n".join(
            [f"- Related indicator: {indicator.code} — {indicator.text}" for indicator in indicators]
        )
    return f"{header}\n\n{body}\n\n{AI_DRAFT_DISCLAIMER}"


def _resolve_scope(
    *,
    framework: Framework,
    scope: str,
    indicator_id: int | None,
    indicator_ids: list[int] | None,
    area_id: int | None,
    standard_id: int | None,
) -> DocumentationScope:
    if scope == DocumentationScopeChoices.SINGLE:
        if not indicator_id:
            raise ValidationError("indicator_id is required for single_indicator scope.")
        exists = Indicator.objects.filter(framework=framework, pk=indicator_id, is_active=True).exists()
        if not exists:
            raise ValidationError("Indicator not found for this framework.")
        return DocumentationScope(scope=scope, indicator_ids=[indicator_id])

    if scope == DocumentationScopeChoices.SELECTED:
        ids = [int(x) for x in (indicator_ids or []) if x]
        if not ids:
            raise ValidationError("indicator_ids is required for selected_indicators scope.")
        found_ids = set(
            Indicator.objects.filter(framework=framework, pk__in=ids, is_active=True).values_list("id", flat=True)
        )
        missing = [row for row in ids if row not in found_ids]
        if missing:
            raise ValidationError("One or more indicators were not found for this framework.")
        return DocumentationScope(scope=scope, indicator_ids=ids)

    if scope == DocumentationScopeChoices.AREA:
        if not area_id:
            raise ValidationError("area_id is required for area scope.")
        ids = list(
            Indicator.objects.filter(framework=framework, area_id=area_id, is_active=True)
            .order_by("sort_order", "code")
            .values_list("id", flat=True)
        )
        if not ids:
            raise ValidationError("No indicators found for the selected area.")
        return DocumentationScope(scope=scope, indicator_ids=ids)

    if scope == DocumentationScopeChoices.STANDARD:
        if not standard_id:
            raise ValidationError("standard_id is required for standard scope.")
        ids = list(
            Indicator.objects.filter(framework=framework, standard_id=standard_id, is_active=True)
            .order_by("sort_order", "code")
            .values_list("id", flat=True)
        )
        if not ids:
            raise ValidationError("No indicators found for the selected standard.")
        return DocumentationScope(scope=scope, indicator_ids=ids)

    if scope == DocumentationScopeChoices.FRAMEWORK:
        ids = list(
            Indicator.objects.filter(framework=framework, is_active=True)
            .order_by("sort_order", "code")
            .values_list("id", flat=True)
        )
        if not ids:
            raise ValidationError("No active indicators found for this framework.")
        return DocumentationScope(scope=scope, indicator_ids=ids)

    raise ValidationError("Unsupported documentation scope.")


@transaction.atomic
def generate_framework_documentation_draft(
    *,
    actor,
    framework: Framework,
    scope: str,
    kind: str,
    user_instruction: str = "",
    indicator_id: int | None = None,
    indicator_ids: list[int] | None = None,
    area_id: int | None = None,
    standard_id: int | None = None,
) -> DocumentDraft:
    if kind not in DocumentDraftKindChoices.values:
        raise ValidationError("Unsupported document kind.")

    resolved = _resolve_scope(
        framework=framework,
        scope=scope,
        indicator_id=indicator_id,
        indicator_ids=indicator_ids,
        area_id=area_id,
        standard_id=standard_id,
    )
    indicators = list(
        Indicator.objects.filter(framework=framework, pk__in=resolved.indicator_ids, is_active=True)
        .select_related("area", "standard")
        .order_by("sort_order", "code")
    )
    primary_indicator = indicators[0]

    config = get_ai_config()
    feature = "Framework Documentation"

    if not config.demo_mode:
        try:
            validate_ai_config()
        except AIConfigurationError as exc:
            error_msg = str(exc)
            log_ai_usage(
                user=actor,
                feature=feature,
                config=config,
                is_success=False,
                error_message=error_msg,
                framework=framework,
                indicator_code=primary_indicator.code,
                metadata={"scope": scope, "kind": kind},
            )
            raise ValidationError(error_msg) from exc

    prompt = _build_framework_prompt(
        framework=framework,
        indicators=indicators,
        kind=kind,
        user_instruction=user_instruction,
    )

    if config.demo_mode:
        content = _demo_content(framework=framework, indicators=indicators, kind=kind)
        ai_usage_log = log_ai_usage(
            user=actor,
            feature=feature,
            config=config,
            is_success=True,
            framework=framework,
            indicator_code=primary_indicator.code,
            metadata={"scope": scope, "kind": kind, "demo": True},
        )
        draft = DocumentDraft.objects.create(
            framework=framework,
            indicator=primary_indicator,
            title=f"{framework.name} — {kind} (Draft)",
            draft_kind=kind,
            document_type=_document_type_for_kind(kind),
            draft_content=content,
            prompt_snapshot={"prompt": prompt, "scope": scope, "kind": kind, "indicator_ids": resolved.indicator_ids},
            source="AI",
            provider=config.provider,
            model="demo-mode",
            ai_usage_log=ai_usage_log,
            generated_by=actor,
            review_status="HUMAN_REVIEW_REQUIRED",
            is_advisory=True,
        )
        draft.related_indicators.add(*indicators)
        return draft

    start_time = time.time()
    try:
        if config.provider == "gemini":
            ai_content = generation._call_gemini_api(prompt, config.model, config.api_key)
            model_name = config.model
        else:
            raise ValidationError(f"Unknown AI provider: {config.provider}")

        full_content = f"{ai_content}\n\n{AI_DRAFT_DISCLAIMER}"
        ai_usage_log = log_ai_usage(
            user=actor,
            feature=feature,
            config=config,
            is_success=True,
            duration_ms=int((time.time() - start_time) * 1000),
            framework=framework,
            indicator_code=primary_indicator.code,
            metadata={"scope": scope, "kind": kind, "indicator_count": len(indicators)},
        )
        draft = DocumentDraft.objects.create(
            framework=framework,
            indicator=primary_indicator,
            title=f"{framework.name} — {kind} ({timezone.now().strftime('%Y-%m-%d %H:%M')})",
            draft_kind=kind,
            document_type=_document_type_for_kind(kind),
            draft_content=full_content,
            prompt_snapshot={"prompt": prompt, "scope": scope, "kind": kind, "indicator_ids": resolved.indicator_ids},
            source="AI",
            provider=config.provider,
            model=model_name,
            ai_usage_log=ai_usage_log,
            generated_by=actor,
            review_status="HUMAN_REVIEW_REQUIRED",
            is_advisory=True,
        )
        draft.related_indicators.add(*indicators)
        return draft
    except Exception as exc:
        error_msg = f"Framework documentation drafting failed: {str(exc)}"
        log_ai_usage(
            user=actor,
            feature=feature,
            config=config,
            is_success=False,
            error_message=error_msg,
            duration_ms=int((time.time() - start_time) * 1000),
            framework=framework,
            indicator_code=primary_indicator.code,
            metadata={"scope": scope, "kind": kind, "indicator_count": len(indicators)},
        )
        raise ValidationError(error_msg) from exc

