# 01 — Current Workflow Audit

## Will this help the final objective?
Yes — this audit maps what already exists vs. the intended accreditation completion workflow, so we only implement what closes real gaps.

## Scope and assumptions
- Audit is based on repo inspection as of `2026-05-07 11:10 UTC`.
- “Complete?” means “supports the core workflow reliably with tests and E2E coverage”, not merely “some endpoints exist”.
- This document will be updated as delegated workstreams (Playwright + coverage runs) report results.

## Workflow audit table

| Area | Existing? | Complete? | Current problem | Files involved | Helps final objective? |
|---|---|---|---|---|---|
| Framework creation/import | Yes | Partial | Need verify API/UI coverage + validation edge-cases/test strength | `backend/apps/frameworks/models/framework.py`, `backend/apps/frameworks/services.py` | Yes |
| Framework-level indicators | Yes | Partial | Confirm UI surfaces and RBAC; ensure indicators are framework-level only | `backend/apps/indicators/models/indicator.py` | Yes |
| Framework-level AI classification | Yes | Partial | Admin-only flow exists; needs continued safety tests and E2E stability | `backend/apps/api/urls.py`, `frontend/components/screens/indicator-classification-screen.tsx`, `frontend/lib/hooks/use-indicator-classification.ts`, `backend/apps/ai_actions/services/classification.py` | Yes |
| Project creation from framework | Yes | Partial | Initialization exists and appears idempotent; needs more edge-case coverage + E2E stability | `backend/apps/projects/models/project.py`, `backend/apps/projects/services.py`, `backend/apps/api/views/projects.py` | Yes |
| Project-specific working indicators | Yes | Partial | Verify initialization correctness and idempotency | `backend/apps/indicators/models/indicator.py` (ProjectIndicator) | Yes |
| Evidence status tracking | Yes | Partial | Verify lifecycle rules, RBAC, and UI flows; tests likely incomplete | `backend/apps/evidence/models/evidence.py`, `backend/apps/evidence/services.py` | Yes |
| Evidence links/uploads | Yes | Partial | Validate evidence source types and required fields; verify UI handling | `backend/apps/evidence/models/evidence.py` | Yes |
| Owner assignment | Yes | Partial | Need confirm API/UI + enforcement in transitions | `backend/apps/indicators/models/indicator.py` | Yes |
| Reviewer/approver workflow | Yes | Partial | Need confirm transition service + RBAC + Playwright stability | `backend/apps/workflow/*`, `backend/apps/indicators/models/indicator.py` | Yes |
| Submit/return/reopen workflow | Yes | Partial | Need confirm service-layer enforcement and tests for invalid transitions | `backend/apps/workflow/guards.py`, `backend/apps/workflow/*` | Yes |
| AI advisory generation | Yes | Partial | Need confirm error handling for missing key/provider failure + logging | `backend/apps/ai_actions/*` | Yes |
| AI document drafting | Yes | Partial | Drafting exists for single indicator (framework or project context); missing “scope” (multi-indicator / domain / full framework) and user-friendly framework UI | `backend/apps/ai_actions/services/document_drafting.py`, `backend/apps/ai_actions/models/document_draft.py`, `frontend/components/screens/admin-document-generation-queue-screen.tsx` | Yes |
| Draft save | Yes | Partial | Confirm API/UI + audit/metadata correctness | `backend/apps/ai_actions/models/document_draft.py` | Yes |
| Draft review | Yes (model fields) | Partial | Confirm implemented workflow and permissions | `backend/apps/ai_actions/models/document_draft.py` | Yes |
| Draft promotion to evidence | Yes | Partial | Promotion service exists; must ensure governed RBAC is enforced in API and that promotion doesn’t auto-mark indicator MET | `backend/apps/ai_actions/services/document_drafting.py`, `backend/apps/api/urls.py`, `frontend/components/screens/document-draft-review-screen.tsx` | Yes |
| Final pack/export | Yes | Partial | Export endpoints exist; needs E2E stabilization and ensure readiness logic matches workflow | `backend/apps/api/urls.py`, `backend/apps/api/views/projects.py`, `backend/apps/exports/*` | Yes |
| RBAC/capability-driven UI | Likely | Partial | Need confirm backend permission model + frontend gating | `backend/apps/accounts/*`, `backend/apps/api/*` | Yes |
| Playwright coverage of core journeys | Yes | Not yet | Baseline reports many failures; needs triage + stabilization | `frontend/tests/*`, `frontend/playwright.config.ts` | Yes |

## Early findings (non-exhaustive)
- Framework entities exist at backend: `Framework`, `Area`, `Standard` in `backend/apps/frameworks/models/framework.py`.
- Framework indicator storage exists and is explicitly framework-linked: `Indicator.framework` in `backend/apps/indicators/models/indicator.py`.
- Project working items exist and include workflow invariants: `ProjectIndicator.save()` blocks direct status/flag mutation unless guarded via `apps.workflow.guards.workflow_transition_is_allowed()` in `backend/apps/indicators/models/indicator.py`.
- Evidence model exists and validates source-specific required fields: `EvidenceItem.clean()` in `backend/apps/evidence/models/evidence.py`.
- Document drafts exist as a first-class model with explicit “advisory” flag and promotion linkage: `backend/apps/ai_actions/models/document_draft.py`.
- REST API coverage for core workflow appears broad: projects, initialization, project indicators + workflow actions, evidence CRUD/review, exports, admin classification and draft workflows via `backend/apps/api/urls.py`.
- Frontend already has admin-facing document drafting surfaces (queue + review/promotion), but the sprint’s required “Framework Documentation AI” user workflow likely needs a dedicated, non-admin-friendly entrypoint and multi-indicator scopes.
