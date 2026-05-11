# UI / Backend Parity Review

For each area, record whether backend/frontend/API wiring/permissions/tests/runtime verification exist.

Statuses:
- VERIFIED
- BACKEND ONLY
- FRONTEND ONLY
- PARTIAL
- BROKEN
- UNKNOWN

## Parity Matrix

Legend:

- Backend exists? = code present in `backend/apps/api/urls.py` and corresponding view/service.
- Frontend exists? = route/screen present in Next build output and/or screen file list.
- API wired? / Capability enforced? = inferred from presence of endpoints + use of `AdminOrLeadPermission` / workflow permissions; not fully runtime-probed unless stated.

| Area | Backend exists? | Frontend exists? | API wired? | Capability enforced? | Test exists? | Runtime verified? | Status |
|---|---:|---:|---:|---:|---:|---:|---|
| FMS/framework import UI | YES (`/api/admin/import/validate-framework/`, `/api/admin/frameworks/import/`) | YES (`/admin/frameworks`) | UNKNOWN | YES (admin/lead permission on admin endpoints) | YES (backend framework import tests present) | UNKNOWN | PARTIAL |
| AI Classification page | YES (`/api/admin/frameworks/<id>/classification/`, bulk-review, per-indicator update) | YES (`/admin/frameworks/classification`) | YES (Playwright routes align with backend paths) | YES | YES (backend tests + Playwright spec) | PARTIAL (Playwright runs with route stubs) | VERIFIED |
| Bulk AI Classification approval controls | YES (`/api/admin/frameworks/<id>/classification/bulk-review/`) | YES (Approve Selected button in E2E) | YES | YES | YES (backend tests + Playwright spec) | PARTIAL | VERIFIED |
| AI Usage page | YES (`/api/admin/ai/usage/`) | YES (`/admin/ai/usage`) | UNKNOWN | YES | YES (backend tests include admin endpoints) | UNKNOWN | PARTIAL |
| AI Health/Test Connection action | YES (`/api/admin/ai/health/`, `/api/admin/ai/test-connection/`) | YES (`/admin/system-health`) | UNKNOWN | YES | YES (backend tests include provider/demo mode coverage) | UNKNOWN | PARTIAL |
| Document Generation Queue | YES (`/api/admin/queues/document-generation/`, generate-draft) | YES (`/admin/queues/document-generation`) | UNKNOWN | YES | YES (backend tests for drafting endpoints) | UNKNOWN | PARTIAL |
| Draft review modal/page | YES (`/api/admin/document-drafts/<id>/`, promote-to-evidence) | YES (`/admin/document-drafts/[id]`) | UNKNOWN | YES | YES (backend tests for promotion + drafting) | UNKNOWN | PARTIAL |
| Evidence promotion action | YES (promote-to-evidence endpoint) | YES (promotion UI present in draft review screen) | UNKNOWN | YES | YES (backend tests) | UNKNOWN | PARTIAL |
| User management | YES (`/api/admin/users/`, update) | YES (`/admin/users`) | UNKNOWN | YES | UNKNOWN | UNKNOWN | PARTIAL |
| Role assignment | YES (user role field; admin user update endpoint) | YES (user admin UI route exists) | UNKNOWN | YES | UNKNOWN | UNKNOWN | PARTIAL |
| Password reset | YES (`/api/admin/users/<id>/password/`) | UNKNOWN | UNKNOWN | YES | UNKNOWN | UNKNOWN | UNKNOWN |
| Print Pack export | YES (`/api/projects/<id>/exports/print-bundle/` via exports views) | YES (`/projects/[projectId]/print-pack`) | UNKNOWN | YES | UNKNOWN | UNKNOWN | PARTIAL |

Notes:

- For Playwright, only the two requested specs were executed; smoke is a real run against Docker via Caddy; classification spec uses request stubbing.
- Several items remain “UNKNOWN” for wiring/runtime because they were not exercised end-to-end in this verification pass.
