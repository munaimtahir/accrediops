# Migration Drift Analysis

## Initial State

The verification report indicated that `manage.py makemigrations --check --dry-run` was failing due to a duplicate `EvidenceRequirementSuggestion` model existing in both the `indicators` and `ai_actions` apps.

## Investigation

Upon running the command during the baseline phase, it passed with "No changes detected". This was a direct contradiction of the verification report.

To investigate, the following files were inspected:

1.  `backend/apps/indicators/models/indicator.py`
2.  `backend/apps/ai_actions/models/evidence_requirement_suggestion.py`
3.  Migration files in both `indicators` and `ai_actions` apps.

## Findings

1.  The `EvidenceRequirementSuggestion` model is fully defined in `backend/apps/indicators/models/indicator.py`. This is its canonical location.
2.  The file `backend/apps/ai_actions/models/evidence_requirement_suggestion.py` contains only a "compatibility shim":
    ```python
    """Compatibility shim for the canonical evidence requirement suggestion model."""
    from apps.indicators.models import EvidenceRequirementSuggestion
    __all__ = ["EvidenceRequirementSuggestion"]
    ```
3.  The `indicators` app contains `migrations/0005_evidencerequirementsuggestion.py`, which creates the model's database table.
4.  The `ai_actions` app does **not** contain a conflicting migration for this model.
5.  `manage.py showmigrations` confirmed that the `indicators/0005` migration was already applied.

## Conclusion

**The migration drift issue was already fixed in the codebase before this sprint began.**

The state described in the verification report was accurate at the time, but a subsequent refactoring had already resolved the issue by:
1.  Consolidating the model definition into the `indicators` app.
2.  Using an import shim in the `ai_actions` app.
3.  Removing the conflicting migration file from the `ai_actions` app.

Therefore, no action was required to fix migration drift. This discovery allowed the sprint to focus immediately on the failing tests in the export service.
