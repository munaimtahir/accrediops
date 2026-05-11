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
You classify accreditation checklist indicators and suggest evidence requirements.

For each indicator, provide:
1.  **Classification Metadata**: (existing fields: evidence_type, ai_assistance_level, etc.)
2.  **Evidence Requirement Suggestions**: If the indicator lacks sufficient detail or clarity for evidence fulfillment, suggest specific requirements.

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
    "classification_reason": "Short practical reason",
    "suggested_evidence": [
        {{
            "title": "Suggested Evidence Title",
            "description": "Detailed description of the evidence needed.",
            "evidence_category": "DOCUMENT_POLICY", # Corresponds to EvidenceTypeChoices
            "artifact_type": "SOP", # e.g., SOP, Policy, Register, Photo
            "mandatory": true,
            "ai_generatable": true,
            "physical_proof_required": false,
            "signature_required": false,
            "ongoing_record_required": false,
            "default_document_type": "SOP",
            "primary_action_required": "GENERATE_DOCUMENT"
        }}
    ]
  }}
]

Allowed evidence_type values: {_choices_text(EvidenceTypeChoices.choices)}
Allowed ai_assistance_level values: {_choices_text(AIAssistanceLevelChoices.choices)}
Allowed evidence_frequency values: {_choices_text(EvidenceFrequencyChoices.choices)}
Allowed primary_action_required values: {_choices_text(PrimaryActionRequiredChoices.choices)}

Rules:
- For classification, choose from allowed values only. If unclear, use MANUAL_REVIEW/MANUAL_DECISION/LOW confidence.
- Do not invent compliance status, claim evidence exists, mark complete, or create evidence directly.
- Keep classification_reason short and practical.
- FULL_AI means AI can generate most of the required document/content.
- PARTIAL_AI means AI can help draft, format, prepare checklist, or guide, but human/physical proof is needed.
- NO_AI means real-world proof, official certificate, photo, equipment, or direct compliance work is needed.

- For **Evidence Requirement Suggestions**:
    - If the indicator's `required_evidence` or `fulfillment_guidance` is vague or insufficient, provide concrete, actionable suggestions.
    - Use the indicator's `document_type` and `primary_action_required` to guide the suggestion.
    - If `mandatory` is true, ensure the suggestion is critical.
    - If `ai_generatable` is true, the AI can suggest a template or draft.
    - If `physical_proof_required` is true, suggest a photo, site visit record, or similar.
    - If `ongoing_record_required` is true, suggest a register, log, or recurring report.
    - If AI cannot confidently suggest specific requirements, leave `suggested_evidence` empty or as an empty array.

Indicators:
{rows}
""".strip()
