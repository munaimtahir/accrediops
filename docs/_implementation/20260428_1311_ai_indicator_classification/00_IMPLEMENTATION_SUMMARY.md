# AI Indicator Classification Implementation Summary

## Current branch

main

## Files inspected

- `backend/apps/indicators/models/indicator.py`
- `backend/apps/masters/choices.py`
- `backend/apps/api/serializers/indicator.py`
- `backend/apps/api/serializers/project_indicators.py`
- `backend/apps/api/serializers/admin.py`
- `backend/apps/api/views/admin.py`
- `backend/apps/api/views/dashboard.py`
- `backend/apps/api/urls.py`
- `backend/apps/ai_actions/services/provider.py`
- `backend/apps/ai_actions/services/generation.py`
- `frontend/app/`
- `frontend/components/screens/admin-frameworks-screen.tsx`
- `frontend/lib/hooks/use-framework-management.ts`
- `frontend/lib/hooks/query-keys.ts`
- `frontend/types/index.ts`

## Implementation plan

1. Add locked classification choices and metadata fields to `Indicator`.
2. Reuse the existing `Indicator.evidence_type` field as the classification evidence type, migrated to the locked codes.
3. Expose classification fields through indicator, project indicator, dashboard/worklist, and admin serializers.
4. Add a Gemini-backed classification service that reuses `get_ai_config()` and provider calling conventions.
5. Add admin-only endpoints for framework classification list, AI classification runs, single-row updates, and bulk review.
6. Build an admin framework classification screen linked from Framework Setup and the framework list.
7. Add backend tests with mocked AI responses and frontend smoke coverage.
8. Run Django checks/migration checks/backend tests/frontend build and document results.

## Key assumptions

- `Indicator.evidence_type` is the existing requirement-level evidence category and should become the locked classification axis instead of creating a duplicate field.
- Admin/Lead access is represented by `AdminOrLeadPermission`.
- Classification is advisory metadata on `Indicator`; no `ProjectIndicator`, evidence, workflow, or deployment routing changes are needed.
- Existing Gemini generation can be reused through `get_ai_config()` and the current `google.generativeai` pattern without changing the AI Assist panel.

## Risks

- Migrating existing `evidence_type` values requires a compatibility mapping from old values such as `DOCUMENT`, `POLICY`, `REPORT`, `IMAGE`, `URL`, and `OTHER` to the new locked codes.
- Frontend routing is a small App Router structure, so the classification route should be added without changing the sidebar.
- End-to-end Playwright mocking may depend on existing test fixtures and login helpers; any limitation will be documented.

## What was implemented

- Indicator-level classification fields and locked choice values.
- Migration with existing-indicator `UNCLASSIFIED` default and legacy evidence-type mapping.
- Gemini-backed classification service with structured JSON prompt, safe parsing, batching, and fallback behavior.
- Admin endpoints for list/filter, AI classification run, row update, and bulk review.
- Worklist saved-field filters for future queues.
- Admin UI under Framework Setup for running, filtering, editing, approving, and protecting classifications.
- Backend tests and frontend build verification.

## Intentionally not implemented

- Document generation queue.
- Recurring evidence queue.
- Physical evidence queue.
- Certificate queue.
- Reporting dashboards.
- Evidence creation from classification.
- Workflow/status transitions from classification.
- Caddy, DNS, proxy, or production routing changes.

## Safety notes

- AI classification is only triggered by explicit user actions.
- Classification does not mutate `ProjectIndicator.current_status`.
- Classification does not create `EvidenceItem`.
- Human-reviewed and manually changed classifications are protected by default.
