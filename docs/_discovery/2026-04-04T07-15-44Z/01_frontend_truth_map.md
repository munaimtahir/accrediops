# Frontend Truth Map

## Route inventory source
`OUT/discovery/2026-04-04T07-15-44Z/frontend_route_inventory.txt`

## Major route truth map

| Route | Entry point | Purpose | API dependencies | Current status | Notes |
|---|---|---|---|---|---|
| `/projects` | `frontend/app/(workbench)/projects/page.tsx` → `ProjectsListScreen` | Project register and entry | `GET /api/projects/` | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Listing works; no UI flow to create a new project. |
| `/projects/[projectId]` | `project-overview` screen | Project hub actions | `GET /api/projects/{id}/`, progress, export/clone mutations | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Clone is wired; export buttons wired; creation/init flow absent. |
| `/projects/[projectId]/worklist` | `project-worklist` screen | Primary grouped indicator worklist | `GET /api/dashboard/worklist/` + progress/users | **WORKING PERFECTLY** | Filters, pagination, grouping, empty/loading/error states present. |
| `/project-indicators/[id]` | `indicator-detail` screen | Governed indicator workflow + evidence/AI/recurring actions | indicator detail + evidence + ai + command endpoints | **WORKING PERFECTLY** | Uses command endpoints only (`start/send-for-review/mark-met/reopen`), separates evidence review and AI acceptance. |
| `/projects/[projectId]/recurring` | `project-recurring` screen | Due/overdue recurring queue + submit | recurring queue + submit endpoint | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Submit is wired; approval handled in indicator detail, not queue screen. |
| `/projects/[projectId]/print-pack` | `project-print-pack` screen | Structured print pack preview | `GET /api/exports/projects/{id}/print-bundle/` | **WORKING PERFECTLY** | Hierarchy + evidence references + physical fields displayed. |
| `/projects/[projectId]/client-profile` | `project-client-profile` screen | Client variable profile edit + preview | project detail, client profile GET/PATCH, variables preview | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Works when linked; no first-class project-level linking flow on this screen. |
| `/projects/[projectId]/inspection` | `project-inspection` screen | Inspection projection + pre-check | inspection view + pre-inspection check | **WORKING PERFECTLY** | Screen and tests present. |
| `/projects/[projectId]/readiness` | `project-readiness` screen | Readiness/risk summary | `GET /api/projects/{id}/readiness/` | **WORKING PERFECTLY** | Live data surface present. |
| `/projects/[projectId]/exports` | `project-export-history` screen | Export history + generate | export history + generate endpoints | **WORKING PERFECTLY** | Tested and wired. |
| `/frameworks/[id]/analysis` | `framework-analysis` screen | Framework metrics | framework analysis endpoint | **WORKING PERFECTLY** | Live metrics view. |
| `/admin`, `/admin/*` | admin screens | Admin metrics/users/masters/audit/overrides/import logs | multiple `/api/admin/*` + `/api/audit/` | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Data views work; override screen is read/report oriented, not command execution UI. |
| `/login` | `login-screen` | Session login | `/api/auth/session/`, `/api/auth/login/` | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Route exists, but Playwright selector assertion for title failed in current runtime run. |

## Notable frontend truth findings
1. Auth guard is enforced at workbench layout level.
2. Error handling is consistently toast/panel-based across key screens.
3. Loading + empty states are broadly present (skeletons + EmptyState).
4. Role-based action disabling exists in high-risk workflows (indicator commands, clone button).
5. Major missing UX: **project creation/initiation UI path** from current visible screens.
