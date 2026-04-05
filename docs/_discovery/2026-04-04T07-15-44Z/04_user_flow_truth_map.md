# User Flow Truth Map

| Workflow | Roles | Entry | Backend endpoints | Real status | Notes |
|---|---|---|---|---|---|
| Login / session | all | `/login` | `/api/auth/session/`, `/api/auth/login/`, `/api/auth/logout/` | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Route/session logic exists; Playwright login assertion currently failing. |
| Dashboard access | authenticated | `/projects` | `/api/projects/` | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | List works; create-project action missing in visible UI. |
| Project listing/open | authenticated | projects table | `/api/projects/`, `/api/projects/{id}/` | **WORKING PERFECTLY** | |
| Add new project | admin/lead expected | *(not surfaced in current UI)* | `POST /api/projects/` | **NOT BUILT / NOT EXPOSED / NOT WIRED** | Backend exists; frontend entry absent. |
| Clone/reuse project | admin/lead | project overview modal | `POST /api/projects/{id}/clone/` | **WORKING PERFECTLY** | Verified in backend tests and UI wiring. |
| Indicator navigation | authenticated | worklist → indicator detail | `/api/dashboard/worklist/`, `/api/project-indicators/{id}/` | **WORKING PERFECTLY** | |
| Evidence add/edit/review | owner/reviewer | indicator detail | `/api/evidence/*` | **WORKING PERFECTLY** | Review separated from indicator state. |
| Indicator workflow transitions | owner/approver/admin | indicator action toolbar | command endpoints (`start/send-for-review/mark-met/reopen`) | **WORKING PERFECTLY** | Command-only model respected. |
| Recurring queue submit | owner | project recurring | `/api/recurring/queue/`, `/submit/` | **WORKING PERFECTLY** | |
| Recurring approve/reject | reviewer/approver | indicator recurring modal | `/api/recurring/instances/{id}/approve/` | **WORKING PERFECTLY** | |
| AI generate/accept | operator | indicator AI panel | `/api/ai/generate/`, `/api/ai/outputs/{id}/accept/` | **WORKING PERFECTLY** | Advisory behavior maintained. |
| Readiness + inspection | lead/admin | readiness / inspection pages | readiness + inspection endpoints | **WORKING PERFECTLY** | |
| Print/export flows | lead/admin | print pack + export history | `/api/exports/projects/{id}/*` | **WORKING PERFECTLY** | Structured print hierarchy available. |
| Client profile variable workflow | lead/admin | project client profile | `/api/client-profiles/*` | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Update/preview works for linked profile; linking path weak. |
| Admin controls | admin/lead | `/admin/*` | admin dashboard/users/masters/audit/overrides/import | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Some flows are operational reporting, not full command workflows. |
