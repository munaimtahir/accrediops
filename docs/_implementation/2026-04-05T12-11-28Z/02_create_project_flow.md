# Create Project + Initialize from Framework Flow

## Frontend entry point
- Projects register screen: `frontend/components/screens/projects-list-screen.tsx`
- Primary action: **Create project** button in page header.
- Role gating:
  - Enabled for `ADMIN` and `LEAD`.
  - Disabled for non-authorized roles.

## Route(s) involved
- Source: `/projects`
- Success destination: `/projects/{id}` (newly created project workspace)

## API wiring used
- Create project:
  - `POST /api/projects/`
  - Frontend hook: `useCreateProject` in `frontend/lib/hooks/use-mutations.ts`
- Initialize from framework:
  - `POST /api/projects/{id}/initialize-from-framework/`
  - Frontend hook: `useInitializeProjectFromFramework`
- Optionally link client profile at create time through `client_profile` field.

## Validation behavior
- Required fields enforced by form controls and backend serializer:
  - project name
  - client name
  - accrediting body name
  - framework
  - start date
  - target date
- Initialize behavior is explicit via checkbox:
  - checked (default): create + initialize
  - unchecked: create draft only
- API errors surface via toast with backend-safe message extraction.

## Success path
1. User opens create modal from projects register.
2. User submits valid create payload.
3. Frontend calls create endpoint.
4. If initialize is enabled, frontend calls initialize endpoint for returned `project.id`.
5. Success toast shown.
6. Modal closes and router navigates to `/projects/{id}`.

## Role rules
- Create and manage actions are disabled in UI for non `ADMIN`/`LEAD`.
- Backend permissions enforce same policy on mutation endpoints (403 for unauthorized).

## Test plan and verification
- Backend:
  - `backend/apps/api/tests/test_project_create_and_initialize.py`
  - verifies admin create + initialize and unauthorized create rejection.
- Frontend unit:
  - `frontend/tests/create-project-form.test.tsx`
  - covers create+initialize and draft-only branches.
  - `frontend/tests/project-list-screen.test.tsx`
  - covers role-based button availability.
- Playwright:
  - `frontend/tests/e2e/app-flows.spec.ts`
  - test `create project and initialize from framework flow works`.

