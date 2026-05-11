# Migration Drift Analysis

## What was wrong

- `python manage.py makemigrations --check --dry-run` previously failed.
- `EvidenceRequirementSuggestion` existed as a real model in `indicators` but the migration state was not cleanly converged.
- The AI-actions app had a shim model module, which made the model origin ambiguous until the canonical model was re-centered.

## Fix applied

- Added canonical migration:
  - `backend/apps/indicators/migrations/0005_evidencerequirementsuggestion.py`
- Kept `EvidenceRequirementSuggestion` canonical in `apps.indicators.models.indicator`.
- Kept `apps.ai_actions.models.evidence_requirement_suggestion` as a shim re-export only.

## Verification

- `python manage.py makemigrations --check --dry-run` -> pass
- `python manage.py migrate` -> pass
- `python manage.py check` -> pass

