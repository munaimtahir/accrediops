# Create Project + Initialize Flow Design

## Frontend entry point added
- Entry point is the **Create project** action in `ProjectsListScreen` (`/projects`), opening a modal containing `CreateProjectForm`.
- On success, modal closes and route transitions to `/projects/{id}`.

## Routes involved
- `/projects` (create entry and form modal)
- `/projects/[projectId]` (post-create landing workspace)

## APIs used
- `GET /api/frameworks/` to populate framework selector.
- `POST /api/projects/` to create project (draft or explicit status payload).
- `POST /api/projects/{id}/initialize-from-framework/` when initialize checkbox is enabled.

## Validation behavior
- Form requires:
  - project name
  - client name
  - accrediting body name
  - framework
  - start date
  - target date
- API-side validation and permission failures are surfaced via toast error messages (safe API message extraction).

## Success path
1. User opens create modal from `/projects`.
2. User fills required fields and submits.
3. Frontend creates project via `POST /api/projects/`.
4. If initialize checkbox is enabled (default), frontend calls initialize endpoint.
5. User sees success toast and is redirected to created project workspace.

## Role and permission rules
- UI create action is enabled only for `ADMIN` or `LEAD`.
- Non-authorized roles see create action disabled.
- Backend remains source of truth with `ensure_admin_or_lead_access` guard in create/init services.

## Test plan for this flow
- Frontend unit tests:
  - create + initialize path executes both mutations and calls success callback.
  - draft-only path skips initialize mutation.
  - create action disabled for non-admin/non-lead.
- Backend API tests:
  - admin can create and initialize from framework.
  - owner cannot create.
  - frameworks list endpoint returns expected framework rows for selector population.
- E2E:
  - login → projects → create modal → submit with framework → land in created project workspace.
