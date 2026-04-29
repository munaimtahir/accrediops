"""Prompt construction for advisory indicator classification."""

from apps.masters.choices import (
    AIAssistanceLevelChoices,
    ClassificationConfidenceChoices,
    EvidenceFrequencyChoices,
    EvidenceTypeChoices,
    PrimaryActionRequiredChoices,
)


def _choices_text(choices) -> str:
    return ", ".join(choice for choice, _ in choices)


def build_indicator_classification_prompt(indicators) -> str:
    rows = []
    for indicator in indicators:
        rows.append(
            {
                "indicator_id": indicator.id,
                "indicator_code": indicator.code,
                "indicator_text": indicator.text,
                "area": getattr(indicator.area, "name", ""),
                "area_code": getattr(indicator.area, "code", ""),
                "standard": getattr(indicator.standard, "name", ""),
                "standard_code": getattr(indicator.standard, "code", ""),
                "required_evidence": indicator.required_evidence_description,
                "current_evidence_type": indicator.evidence_type,
                "document_type": indicator.document_type,
                "fulfillment_guidance": indicator.fulfillment_guidance,
                "is_recurring": indicator.is_recurring,
                "recurrence_frequency": indicator.recurrence_frequency,
                "recurrence_mode": indicator.recurrence_mode,
                "evidence_reuse_policy": indicator.evidence_reuse_policy,
            }
        )

    return f"""
You classify accreditation checklist indicators into saved advisory metadata.

Return only valid JSON. Do not use markdown fences. Return an array with one object per indicator:
[
  {{
    "indicator_id": 123,
    "indicator_code": "IND-1",
    "evidence_type": "DOCUMENT_POLICY",
    "ai_assistance_level": "PARTIAL_AI",
    "evidence_frequency": "ONE_TIME",
    "primary_action_required": "GENERATE_DOCUMENT",
    "classification_confidence": "MEDIUM",
    "classification_reason": "Short practical reason"
  }}
]

Allowed evidence_type values: {_choices_text(EvidenceTypeChoices.choices)}
Allowed ai_assistance_level values: {_choices_text(AIAssistanceLevelChoices.choices)}
Allowed evidence_frequency values: {_choices_text(EvidenceFrequencyChoices.choices)}
Allowed primary_action_required values: {_choices_text(PrimaryActionRequiredChoices.choices)}
Allowed classification_confidence values: {_choices_text(ClassificationConfidenceChoices.choices)}

Rules:
- Choose from allowed values only.
- If unclear, use evidence_type MANUAL_REVIEW, primary_action_required MANUAL_DECISION, classification_confidence LOW.
- Do not invent compliance status.
- Do not claim evidence exists.
- Do not mark complete.
- Do not create evidence.
- Keep classification_reason short and practical.
- FULL_AI means AI can generate most of the required document/content.
- PARTIAL_AI means AI can help draft, format, prepare checklist, or guide but human/physical proof remains needed.
- NO_AI means real-world proof, official certificate, photo, equipment, or direct compliance work is needed.

Indicators:
{rows}
""".strip()
