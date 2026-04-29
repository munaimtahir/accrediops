# Next Recommended Task

Build the first saved-field queue using this classification data.

Recommended next phase:

1. Add a Document Generation Queue filtered by `primary_action_required=GENERATE_DOCUMENT` and `ai_assistance_level` in `FULL_AI` or `PARTIAL_AI`.
2. Use only saved indicator classification fields.
3. Keep queue actions advisory and separate from evidence creation until explicitly approved.
4. Add focused backend filters and a small frontend queue screen under the existing project/admin workflow.
