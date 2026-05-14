# Duplicate Suggestion Model Resolution

This issue is directly related to the findings in `02_MIGRATION_DRIFT_ANALYSIS.md`.

## Summary

The risk of a duplicate `EvidenceRequirementSuggestion` model and its associated state was identified as a key architectural drift concern. The goal was to ensure a single, canonical model for AI-generated suggestions that remains purely advisory.

## Resolution

The investigation confirmed that this issue had been preemptively resolved. The architecture is now clean:

*   **Single Source of Truth:** `EvidenceRequirementSuggestion` is defined only once, in the `indicators` app.
*   **Clean Separation:** The `ai_actions` app, which is responsible for generating suggestions, correctly imports the canonical model from the `indicators` app via a compatibility shim. It does not define its own version.
*   **Correct Migration:** A single, non-conflicting migration for the model exists in the `indicators` app and has been applied.

This setup adheres to the desired final architecture where `EvidenceRequirementSuggestion` is an advisory draft and does not interfere with the official `EvidenceRequirement` state used for project fulfillment and readiness calculations.

No code changes were necessary for this stage of the sprint.
