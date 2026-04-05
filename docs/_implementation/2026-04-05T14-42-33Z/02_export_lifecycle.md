# Export Lifecycle Completion

## Lifecycle audited
- Trigger endpoint: `POST /api/exports/projects/{id}/generate/`
- History endpoint: `GET /api/exports/projects/{id}/history/`
- On-demand export payload surfaces:
  - `GET /api/exports/projects/{id}/print-bundle/`
  - `GET /api/exports/projects/{id}/excel/`
  - `GET /api/exports/projects/{id}/physical-retrieval/`

## Real lifecycle behavior
1. User triggers export generation.
2. Backend creates `ExportJob` with persisted fields:
   - type
   - status (`READY` or `WARNING` based on validation warnings)
   - warnings payload
   - file_name
   - parameters
3. History endpoint returns created job rows for project.
4. UI reflects generated row and status in export history table.

## Hardening implemented
- Frontend export history screen now enforces role gating:
  - generate/export buttons disabled unless role is `ADMIN` or `LEAD`
  - unauthorized click paths show explicit toast feedback
  - physical retrieval action follows same permission boundary
- Sidebar hides project **Export History** navigation for non-admin/non-lead users.

## Tests added/updated
- Backend:
  - `backend/apps/api/tests/test_governance_hardening.py`
    - `test_export_lifecycle_history_and_permissions`
- Frontend unit:
  - `frontend/tests/export-history-screen.test.tsx`
    - verifies generate action calls export job creation and success feedback
  - `frontend/tests/sidebar.test.tsx`
    - verifies export/admin links hidden for non-admin roles
- E2E:
  - `frontend/tests/e2e/core-journeys.spec.ts`
    - `export lifecycle creates history row with persisted status`
    - `non-admin user cannot access export history actions`

## Result
- Export generation/history lifecycle is now backend-persistent, UI-reflected, and permission-bounded with positive and negative validation coverage.

