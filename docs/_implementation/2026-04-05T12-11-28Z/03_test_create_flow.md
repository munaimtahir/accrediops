# Test Expansion: Create/Init + Core Journey

## Tests added/updated in this sprint

### Playwright
- Added shared auth helper:
  - `frontend/tests/e2e/helpers.ts`
- Updated specs to consume shared helper:
  - `frontend/tests/e2e/app-flows.spec.ts`
  - `frontend/tests/e2e/core-journeys.spec.ts`
- Expanded browser-depth coverage in `core-journeys.spec.ts` with:
  - clone project → open cloned workspace
  - admin route access verification post-login
- Stabilized clone test by waiting for deterministic route transition to new project path.

### Existing create/init coverage validated
- Frontend unit:
  - `frontend/tests/create-project-form.test.tsx`
  - `frontend/tests/project-list-screen.test.tsx`
- Backend:
  - `backend/apps/api/tests/test_project_create_and_initialize.py`
- E2E:
  - `frontend/tests/e2e/app-flows.spec.ts` create/init scenario

## Coverage intent
- Lock auth baseline first to prevent false negatives.
- Prove create+initialize flow from user perspective (not just route presence).
- Prove one adjacent core journey beyond create:
  - worklist/indicator operations (evidence + recurring)
- Add regression-proof checks for clone and admin access while authenticated.

## Browser-verified flows now
- Unauthenticated protected-route redirect.
- Login and post-login project register access.
- Create project and initialize from framework.
- Open created project and navigate to recurring.
- Evidence add + review approval on indicator.
- Recurring submit + approve on indicator context.
- Clone project and open cloned workspace.
- Authenticated admin route access.

## Still not fully covered in browser
- Deep admin override workflows (beyond access).
- Full variable replacement editing scenarios across all template sources.
- Full export job lifecycle assertions beyond route/API availability.

