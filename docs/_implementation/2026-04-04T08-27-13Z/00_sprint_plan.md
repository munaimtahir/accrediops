# Sprint Plan — 2026-04-04T08-27-13Z

## Problem and approach
Discovery confirmed the backend is operational while the highest-value gaps are frontend create/init UX, Playwright auth baseline instability, and contract drift.  
This sprint executes only those gaps in strict order (Phase A→D), then verifies with backend, frontend, and browser test layers.

## Exact sprint scope (implemented now)
1. Build real **Create Project + Initialize from Framework** flow from `/projects`.
2. Stabilize auth/protected-route Playwright baseline for deterministic E2E.
3. Replace placeholder OpenAPI with implemented backend contract truth.
4. Expand and run verification for create/init and core post-login journeys.

## Out of scope for this sprint
- No redesign of app architecture or governance workflow.
- No new status mutation patterns beyond command endpoints.
- No speculative/admin UX redesign beyond auth/E2E stabilization needs.
- No PDF generation feature work (print pack remains structured API/UI output).

## Expected files/components/routes/endpoints involved
- Frontend:
  - `frontend/components/screens/projects-list-screen.tsx`
  - `frontend/components/forms/create-project-form.tsx`
  - `frontend/components/common/modal.tsx`
  - `frontend/playwright.config.ts`
  - `frontend/tests/e2e/global-setup.cjs`
  - `frontend/tests/e2e/app-flows.spec.ts`
  - `frontend/tests/create-project-form.test.tsx`
  - `frontend/tests/project-list-screen.test.tsx`
- Backend/API:
  - `backend/apps/api/views/projects.py`
  - `backend/apps/api/serializers/projects.py`
  - `backend/apps/projects/services.py`
  - `backend/apps/api/urls.py`
- Contract:
  - `contracts/openapi/openapi.yaml`

## Acceptance criteria by phase

### Phase A — Create/init flow
- `/projects` exposes a visible create entry point.
- User can submit project details and optional immediate initialization from selected framework.
- Success redirects user to created project workspace.
- API errors are shown cleanly in UI.
- Action is role-gated in UI.

### Phase B — Auth/E2E baseline
- Unauthenticated protected route access redirects to login deterministically.
- Login flow is stable with seeded credentials and deterministic test data.
- Playwright selectors/expectations are robust for `/login`, `/projects`, and protected routes.

### Phase C — OpenAPI
- Contract file is non-placeholder and covers implemented API surfaces.
- Command endpoints are represented explicitly (start/send-for-review/mark-met/reopen).
- Contract reflects success/error envelope shape.

### Phase D — Verification expansion
- Backend API tests and pytest suite run successfully.
- Frontend build and Vitest run successfully.
- Playwright suite verifies login, projects access, create/init, and a post-login operational journey.
