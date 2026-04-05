# Test Expansion Plan and Delivered Coverage

## Tests added/updated

### Backend
- `backend/apps/api/tests/test_project_create_and_initialize.py`
  - admin create + initialize happy path
  - owner forbidden create path
- `backend/apps/api/tests/test_frameworks_api.py`
  - frameworks list endpoint used by create form
- Existing core suites retained and run, including:
  - clone/reuse
  - variable replacement
  - print pack
  - physical evidence
  - recurring workflows

### Frontend (Vitest)
- `frontend/tests/create-project-form.test.tsx`
  - create + initialize mutation sequence
  - draft-only create path
- `frontend/tests/project-list-screen.test.tsx`
  - create action visible/enabled for admin
  - create action disabled for unauthorized role

### Playwright
- `frontend/tests/e2e/app-flows.spec.ts` stabilized and expanded to verify:
  - protected route redirect to login
  - login page readiness
  - admin login to projects
  - create project + initialize from framework
  - post-login route journey (`/projects/{id}/recurring`)
  - proxy health endpoints

## Coverage intent
- Ensure newly exposed create/init journey is covered at unit, API, and browser layers.
- Ensure auth/protected-route baseline is deterministic so future E2E flow growth is reliable.
- Keep governance-critical operations verifiable without introducing fake/mock-only path claims.

## Browser-verified flows now
1. Unauthenticated guard redirect.
2. Login interaction and landing.
3. Projects page access with role-gated create action visibility.
4. Real create+initialize submission and workspace landing.
5. Post-login operational navigation to recurring queue.
6. Runtime health checks via proxy.

## Remaining not fully covered
- Deep browser-level evidence review approve/reject journey.
- Deep browser-level recurring approve path from indicator context.
- Extended admin override interaction depth beyond visibility/reporting.
