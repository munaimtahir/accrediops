# Data Model And Migration

## Model

Classification is stored on `Indicator`.

Fields added:

- `ai_assistance_level`
- `evidence_frequency`
- `primary_action_required`
- `classification_confidence`
- `classification_reason`
- `classification_review_status`
- `classified_by_ai_at`
- `classification_reviewed_by`
- `classification_reviewed_at`
- `classification_version`

The existing `Indicator.evidence_type` field was reused as the locked evidence type classification axis and changed to the final codes.

## Choices

Choice classes were added in `apps.masters.choices` for:

- `AIAssistanceLevelChoices`
- `EvidenceFrequencyChoices`
- `PrimaryActionRequiredChoices`
- `ClassificationReviewStatusChoices`
- `ClassificationConfidenceChoices`

`EvidenceTypeChoices` now uses the locked values: `DOCUMENT_POLICY`, `RECORD_REGISTER`, `PHYSICAL_FACILITY`, `LICENSE_CERTIFICATE`, `STAFF_TRAINING`, `PROCESS_WORKFLOW`, `AUDIT_QUALITY`, `MIXED_EVIDENCE`, `MANUAL_REVIEW`.

## Migration

Migration: `backend/apps/indicators/migrations/0003_indicator_ai_assistance_level_and_more.py`

Backward compatibility:

- Existing indicators get `classification_review_status=UNCLASSIFIED`.
- Existing classification version starts at `0`.
- Legacy evidence type codes are mapped to locked codes during migration.
- No `ProjectIndicator` workflow/status fields were changed.
