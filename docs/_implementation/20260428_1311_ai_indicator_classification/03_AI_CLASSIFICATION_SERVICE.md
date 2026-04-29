# AI Classification Service

Files:

- `backend/apps/ai_actions/services/classification.py`
- `backend/apps/ai_actions/services/classification_prompts.py`

The service reuses existing AI provider configuration through `get_ai_config()` and the existing Gemini call helper pattern. It does not duplicate API key logic.

Prompt behavior:

- Sends indicator code, text, area, standard, required evidence, existing evidence type, document type, recurrence hints, reuse policy, and fulfillment guidance.
- Requires structured JSON output.
- Restricts output to locked enum codes.
- Instructs AI not to create evidence, mark complete, invent status, or claim evidence exists.

Parsing and safety:

- Accepts raw JSON arrays.
- Accepts JSON wrapped in markdown fences.
- Missing or invalid values fall back to safe manual-review classifications.
- Low confidence maps to `NEEDS_REVIEW`.
- Medium/high confidence maps to `AI_SUGGESTED`.

Batching:

- Batch size is 15 indicators.
- Successful batches are saved even if a later batch fails.
- Each indicator update is isolated in its own transaction.

Advisory-only guarantees:

- Does not update `ProjectIndicator.current_status`.
- Does not create `EvidenceItem`.
- Does not mark indicators complete.
