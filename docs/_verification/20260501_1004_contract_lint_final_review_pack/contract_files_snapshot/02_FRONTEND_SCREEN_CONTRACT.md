# Frontend Screen Contract

Source of truth: `frontend/app/**/page.tsx` routes (plus build output).

This table documents each frontend route and its primary backend contract dependency.

| Frontend Route | Primary Screen | Backend Dependencies (API) |
|---|---|---|
| `/` | Landing | (static) |
| `/login` | Login | `POST /api/auth/login/`, `GET /api/auth/session/` |
| `/healthz` | Health probe | (static route handler) |
| `/projects` | Projects list | `GET/POST /api/projects/` |
| `/projects/[projectId]` | Project detail | `GET/PATCH /api/projects/<pk>/` |
| `/projects/[projectId]/worklist` | Project worklist | `GET /api/dashboard/worklist/` and project indicator endpoints |
| `/project-indicators/[id]` | Project indicator detail | `GET /api/project-indicators/<pk>/` + evidence/ai outputs endpoints |
| `/projects/[projectId]/readiness` | Project readiness | `GET /api/projects/<project_id>/readiness/` |
| `/projects/[projectId]/inspection` | Inspection view | `GET /api/projects/<project_id>/inspection-view/` |
| `/projects/[projectId]/pending-actions` | Pending actions | (worklist-related APIs) |
| `/projects/[projectId]/standards-progress` | Standards progress | `GET /api/projects/<project_id>/standards-progress/` |
| `/projects/[projectId]/areas-progress` | Areas progress | `GET /api/projects/<project_id>/areas-progress/` |
| `/projects/[projectId]/recurring` | Recurring queue | `GET /api/recurring/queue/` + submit/approve instance endpoints |
| `/projects/[projectId]/exports` | Exports | `/api/exports/projects/<project_id>/*` |
| `/projects/[projectId]/print-pack` | Print pack | `/api/exports/projects/<project_id>/print-bundle/` (and/or print UI) |
| `/projects/[projectId]/client-profile` | Client profile | `/api/client-profiles/*` |
| `/frameworks/[id]/analysis` | Framework analysis | `GET /api/frameworks/<framework_id>/analysis/` |
| `/admin` | Admin dashboard | `GET /api/admin/dashboard/` |
| `/admin/frameworks` | Framework admin | `GET/POST /api/admin/frameworks/`, import validate/import |
| `/admin/frameworks/classification` | Framework classification | `GET /api/admin/frameworks/<id>/classification/`, bulk review/update |
| `/admin/queues/document-generation` | Document generation queue | `GET /api/admin/queues/document-generation/`, `POST .../generate-draft/` |
| `/admin/document-drafts/[id]` | Draft review | `GET/PATCH /api/admin/document-drafts/<id>/`, promote endpoint |
| `/admin/ai/usage` | AI usage | `GET /api/admin/ai/usage/` |
| `/admin/system-health` | System health | `GET /api/admin/ai/health/`, `POST /api/admin/ai/test-connection/` |
| `/admin/audit` | Audit log | `GET /api/audit/` |
| `/admin/import-logs` | Import logs | `GET /api/admin/import/logs/` |
| `/admin/client-profiles` | Client profiles | `GET/POST /api/client-profiles/` |
| `/admin/users` | User admin | `GET/PATCH /api/admin/users/*` |
| `/admin/overrides` | Overrides | `GET /api/admin/overrides/` |
| `/admin/masters/document-types` | Master values | `/api/admin/masters/DocumentType/*` |
| `/admin/masters/evidence-types` | Master values | `/api/admin/masters/EvidenceType/*` |
| `/admin/masters/priorities` | Master values | `/api/admin/masters/Priority/*` |
| `/admin/masters/statuses` | Master values | `/api/admin/masters/ProjectIndicatorStatus/*` |
