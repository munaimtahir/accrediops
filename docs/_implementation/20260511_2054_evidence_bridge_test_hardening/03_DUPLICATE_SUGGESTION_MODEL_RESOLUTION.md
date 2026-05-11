# Duplicate Suggestion Model Resolution

## Final state

- `EvidenceRequirementSuggestion` is canonical in `apps.indicators.models.indicator`.
- `apps.ai_actions.models.evidence_requirement_suggestion` now re-exports the canonical model.
- `apps.ai_actions.models.__init__` imports the shim, so callers still resolve the same class path without duplicating state.
- Migration `indicators.0005_evidencerequirementsuggestion` is the single migration that owns the model table.

## Governance result

- AI suggestions remain advisory only.
- Suggestions do not create approved framework requirements automatically.
- Suggestions do not mutate readiness.
- Suggestions can exist separately from approved requirements.

## Test coverage

- `apps/api/tests/test_indicator_classification.py`
  - verifies AI suggestions do not create approved framework requirements
  - verifies project evidence state is not mutated by classification

