"""AI-assisted advisory classification for framework indicators."""

import json
import re
import time
from dataclasses import dataclass, field

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.ai_actions.services.classification_prompts import build_indicator_classification_prompt
from apps.ai_actions.services.generation import _call_gemini_api
from apps.ai_actions.services.provider import get_ai_config
from apps.ai_actions.services.usage import log_ai_usage
from apps.audit.services import log_audit_event, snapshot_instance
from apps.indicators.models import Indicator
from apps.masters.choices import (
    AIAssistanceLevelChoices,
    ClassificationConfidenceChoices,
    ClassificationReviewStatusChoices,
    EvidenceFrequencyChoices,
    EvidenceTypeChoices,
    PrimaryActionRequiredChoices,
    RoleChoices,
)
from apps.workflow.permissions import can_admin_access

BATCH_SIZE = 15
PROTECTED_STATUSES = {
    ClassificationReviewStatusChoices.HUMAN_REVIEWED,
    ClassificationReviewStatusChoices.MANUALLY_CHANGED,
}
UNREVIEWED_STATUSES = {
    ClassificationReviewStatusChoices.AI_SUGGESTED,
    ClassificationReviewStatusChoices.NEEDS_REVIEW,
}


@dataclass
class ClassificationRunResult:
    total_requested: int = 0
    classified_count: int = 0
    skipped_count: int = 0
    failed_count: int = 0
    needs_review_count: int = 0
    errors: list[dict] = field(default_factory=list)

    def as_dict(self) -> dict:
        return {
            "total_requested": self.total_requested,
            "classified_count": self.classified_count,
            "skipped_count": self.skipped_count,
            "failed_count": self.failed_count,
            "needs_review_count": self.needs_review_count,
            "errors": self.errors,
        }


def _allowed_values(choices) -> set[str]:
    return {choice for choice, _ in choices}


def _strip_json_fences(content: str) -> str:
    value = (content or "").strip()
    fenced = re.match(r"^```(?:json)?\s*(.*?)\s*```$", value, flags=re.DOTALL | re.IGNORECASE)
    if fenced:
        return fenced.group(1).strip()
    return value


def _safe_parse_classifications(content: str, indicators: list[Indicator]) -> list[dict]:
    by_id = {indicator.id: indicator for indicator in indicators}
    try:
        parsed = json.loads(_strip_json_fences(content))
        if isinstance(parsed, dict) and isinstance(parsed.get("classifications"), list):
            parsed = parsed["classifications"]
        if not isinstance(parsed, list):
            raise ValueError("Expected a JSON array.")
    except Exception as exc:
        return [_fallback(indicator, f"AI response could not be parsed: {exc}") for indicator in indicators]

    results = []
    seen_ids = set()
    for item in parsed:
        indicator_id = item.get("indicator_id") if isinstance(item, dict) else None
        indicator = by_id.get(indicator_id)
        if indicator is None:
            continue
        seen_ids.add(indicator_id)
        results.append(_normalize_item(indicator, item))

    for indicator in indicators:
        if indicator.id not in seen_ids:
            results.append(_fallback(indicator, "AI response omitted this indicator."))
    return results


def _choice(value, allowed: set[str], default: str) -> str:
    parsed = str(value or "").strip().upper()
    return parsed if parsed in allowed else default


def _fallback(indicator: Indicator, reason: str) -> dict:
    return {
        "indicator_id": indicator.id,
        "indicator_code": indicator.code,
        "evidence_type": EvidenceTypeChoices.MANUAL_REVIEW,
        "ai_assistance_level": AIAssistanceLevelChoices.PARTIAL_AI,
        "evidence_frequency": EvidenceFrequencyChoices.ONE_TIME,
        "primary_action_required": PrimaryActionRequiredChoices.MANUAL_DECISION,
        "classification_confidence": ClassificationConfidenceChoices.LOW,
        "classification_reason": reason[:500],
    }


def _normalize_item(indicator: Indicator, item: dict) -> dict:
    evidence_type = _choice(
        item.get("evidence_type"),
        _allowed_values(EvidenceTypeChoices.choices),
        EvidenceTypeChoices.MANUAL_REVIEW,
    )
    confidence = _choice(
        item.get("classification_confidence"),
        _allowed_values(ClassificationConfidenceChoices.choices),
        ClassificationConfidenceChoices.LOW,
    )
    reason = str(item.get("classification_reason") or "").strip()
    if not reason:
        reason = "AI did not provide a reason."
        confidence = ClassificationConfidenceChoices.LOW
    return {
        "indicator_id": indicator.id,
        "indicator_code": indicator.code,
        "evidence_type": evidence_type,
        "ai_assistance_level": _choice(
            item.get("ai_assistance_level"),
            _allowed_values(AIAssistanceLevelChoices.choices),
            AIAssistanceLevelChoices.PARTIAL_AI,
        ),
        "evidence_frequency": _choice(
            item.get("evidence_frequency"),
            _allowed_values(EvidenceFrequencyChoices.choices),
            EvidenceFrequencyChoices.ONE_TIME,
        ),
        "primary_action_required": _choice(
            item.get("primary_action_required"),
            _allowed_values(PrimaryActionRequiredChoices.choices),
            PrimaryActionRequiredChoices.MANUAL_DECISION,
        ),
        "classification_confidence": confidence,
        "classification_reason": reason[:500],
    }


def _status_for_confidence(confidence: str) -> str:
    if confidence == ClassificationConfidenceChoices.LOW:
        return ClassificationReviewStatusChoices.NEEDS_REVIEW
    return ClassificationReviewStatusChoices.AI_SUGGESTED


def classification_queryset_for_mode(framework, *, mode: str, indicator_ids: list[int] | None, overwrite_human_reviewed: bool):
    queryset = Indicator.objects.filter(framework=framework, is_active=True).select_related("area", "standard")
    if mode == "selected":
        queryset = queryset.filter(id__in=indicator_ids or [])
    elif mode == "unreviewed_only":
        queryset = queryset.filter(classification_review_status__in=UNREVIEWED_STATUSES)
    elif mode == "force_all":
        pass
    else:
        queryset = queryset.filter(classification_review_status=ClassificationReviewStatusChoices.UNCLASSIFIED)

    if not overwrite_human_reviewed:
        queryset = queryset.exclude(classification_review_status__in=PROTECTED_STATUSES)
    return queryset.order_by("area__sort_order", "standard__sort_order", "sort_order", "code")


def _call_classification_ai(indicators: list[Indicator]) -> str:
    config = get_ai_config()
    prompt = build_indicator_classification_prompt(indicators)
    if config.demo_mode:
        return json.dumps([_fallback(indicator, "Demo mode classification placeholder.") for indicator in indicators])
    if not config.is_configured:
        raise ValidationError("AI provider is not configured for classification.")
    if config.provider != "gemini":
        raise ValidationError(f"AI classification is not implemented for provider '{config.provider}'.")
    return _call_gemini_api(prompt, config.model, config.api_key)


def run_framework_indicator_classification(
    *,
    framework,
    actor,
    mode: str = "unclassified_only",
    indicator_ids: list[int] | None = None,
    overwrite_human_reviewed: bool = False,
) -> dict:
    if mode == "force_all" and overwrite_human_reviewed and not can_admin_access(actor):
        raise PermissionDenied("Only ADMIN can force overwrite human-reviewed classifications.")

    queryset = classification_queryset_for_mode(
        framework,
        mode=mode,
        indicator_ids=indicator_ids,
        overwrite_human_reviewed=overwrite_human_reviewed,
    )
    requested_ids = list(
        Indicator.objects.filter(framework=framework, is_active=True)
        .filter(Q(id__in=indicator_ids or []) if mode == "selected" else Q())
        .values_list("id", flat=True)
    )
    indicators = list(queryset)
    result = ClassificationRunResult(total_requested=len(requested_ids) if mode == "selected" else queryset.count())

    if not indicators:
        result.skipped_count = result.total_requested
        return result.as_dict()

    for offset in range(0, len(indicators), BATCH_SIZE):
        batch = indicators[offset : offset + BATCH_SIZE]
        start_time = time.time()
        config = get_ai_config()
        try:
            content = _call_classification_ai(batch)
            items = _safe_parse_classifications(content, batch)
            log_ai_usage(
                user=actor,
                feature="AI Classification",
                config=config,
                is_success=True,
                duration_ms=int((time.time() - start_time) * 1000),
                framework=framework,
                metadata={"batch_size": len(batch), "offset": offset},
            )
        except Exception as exc:
            log_ai_usage(
                user=actor,
                feature="AI Classification",
                config=config,
                is_success=False,
                error_message=str(exc),
                duration_ms=int((time.time() - start_time) * 1000),
                framework=framework,
                metadata={"batch_size": len(batch), "offset": offset},
            )
            result.failed_count += len(batch)
            result.errors.append({"batch_start": offset, "error": str(exc)})
            continue

        for item in items:
            indicator = next((candidate for candidate in batch if candidate.id == item["indicator_id"]), None)
            if indicator is None:
                continue
            before = snapshot_instance(indicator)
            status = _status_for_confidence(item["classification_confidence"])
            with transaction.atomic():
                indicator.evidence_type = item["evidence_type"]
                indicator.ai_assistance_level = item["ai_assistance_level"]
                indicator.evidence_frequency = item["evidence_frequency"]
                indicator.primary_action_required = item["primary_action_required"]
                indicator.classification_confidence = item["classification_confidence"]
                indicator.classification_reason = item["classification_reason"]
                indicator.classification_review_status = status
                indicator.classified_by_ai_at = timezone.now()
                indicator.classification_version = (indicator.classification_version or 0) + 1
                indicator.classification_reviewed_by = None
                indicator.classification_reviewed_at = None
                indicator.save(
                    update_fields=[
                        "evidence_type",
                        "ai_assistance_level",
                        "evidence_frequency",
                        "primary_action_required",
                        "classification_confidence",
                        "classification_reason",
                        "classification_review_status",
                        "classified_by_ai_at",
                        "classification_version",
                        "classification_reviewed_by",
                        "classification_reviewed_at",
                    ]
                )
                log_audit_event(
                    actor=actor,
                    event_type="indicator.classified_by_ai",
                    obj=indicator,
                    before=before,
                    after=snapshot_instance(indicator),
                )
            result.classified_count += 1
            if status == ClassificationReviewStatusChoices.NEEDS_REVIEW:
                result.needs_review_count += 1

    result.skipped_count = max(result.total_requested - result.classified_count - result.failed_count, 0)
    return result.as_dict()
