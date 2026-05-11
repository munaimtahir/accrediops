# 07 — Backend AI Documentation Implementation

## Will this help the final objective?
Yes — it enables framework-level AI-generated documentation drafts (advisory only) that can later be reviewed and governed into project evidence.

## What was implemented

### Models
- `backend/apps/ai_actions/models/document_draft.py`
  - Added `draft_kind` to represent requested output kinds:
    - `SOP`, `POLICY`, `CHECKLIST`, `REGISTER_TEMPLATE`, `EVIDENCE_REQUIREMENT_SHEET`, `GAP_CLOSURE_PLAN`
  - Added `related_indicators` (M2M) to link a draft to multiple framework indicators when generated from selected/domain/full-framework scopes.
  - Added validation that the primary indicator belongs to the same framework.

Migration:
- `backend/apps/ai_actions/migrations/0004_documentdraft_draft_kind_and_more.py`

### Services
- `backend/apps/ai_actions/services/framework_documentation.py`
  - New service `generate_framework_documentation_draft(...)` supporting scopes:
    - `single_indicator`
    - `selected_indicators`
    - `area`
    - `standard`
    - `framework`
  - Supports output kinds:
    - `SOP`, `POLICY`, `CHECKLIST`, `REGISTER_TEMPLATE`, `EVIDENCE_REQUIREMENT_SHEET`, `GAP_CLOSURE_PLAN`
  - Enforces safety boundaries:
    - creates **DocumentDraft** only
    - does **not** create EvidenceItem
    - does **not** mutate ProjectIndicator status
  - Logs AI usage under feature `"Framework Documentation"`.
  - Demo mode generates deterministic draft content with disclaimer.
  - Non-demo mode validates provider configuration and surfaces clear errors.

- `backend/apps/ai_actions/services/document_drafting.py`
  - Ensures single-indicator drafts set `draft_kind` consistently.
  - Ensures drafts are linked to `related_indicators` (self-link for single indicator).
  - Promotion now sets `is_advisory=False` when promoted to evidence (still requires human approval via evidence workflow).

### API
- `backend/apps/api/views/admin.py`
  - Added `FrameworkDocumentationDraftGenerateView` (Admin/Lead gated).
- `backend/apps/api/urls.py`
  - New endpoint:
    - `POST /api/admin/frameworks/<framework_id>/documentation/generate-draft/`

Serializer:
- `backend/apps/api/serializers/admin.py`
  - `FrameworkDocumentationGenerateSerializer`

### Safety rules enforced
- Drafts remain advisory (`is_advisory=True`) and require human review (`review_status=HUMAN_REVIEW_REQUIRED`) when generated via framework documentation workflow.
- Missing AI key/provider misconfiguration returns **400** with a clear message (no silent mutation).
- AI draft generation does not mark any evidence complete or any indicator met.
- Draft → evidence promotion remains governed by the existing Admin/Lead-only promotion endpoint.

## Tests added
- `backend/apps/api/tests/test_framework_documentation_ai.py`
  - demo-mode single-indicator SOP generation
  - demo-mode selected-indicators checklist generation
  - missing AI key returns a clear 400 error

## Commands run (evidence)
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase6_makemigrations_ai_actions.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase6_manage_check.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase6_makemigrations_check_dryrun.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase6_pytest_cov.txt`

## Current limitations
- Frontend workflow entrypoint for “Framework Documentation AI” still needs to be added (Phase 7).
- Some output kinds use deterministic demo-mode templates; real-provider prompt tuning can be iterated later.

