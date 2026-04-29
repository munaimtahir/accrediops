# Backend To Frontend Matrix

| Backend API ID | Method | API Path | Backend View/Handler | Purpose | Frontend Route Using It | Frontend Component/Action | Visible to Role? | Used in Tests? | Status | Gap/Fix Needed |
|---|---|---|---|---|---|---|---|---|---|---|
| BE-01 | GET | `/api/health/` | `BackendHealthView` | health | `/admin/system-health` | `SystemHealthScreen` | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-02 | GET | `/api/auth/session/` | `AuthSessionView` | session | middleware, guards, login/topbar | background hooks | all | yes | MATCHED_E2E | none |
| BE-03 | POST | `/api/auth/login/` | `AuthLoginView` | login | `/login` | `Sign in` | all | yes | MATCHED_E2E | none |
| BE-04 | POST | `/api/auth/logout/` | `AuthLogoutView` | logout | global topbar | `Sign out` | authenticated | yes | MATCHED_E2E | none |
| BE-05 | GET | `/api/users/` | `UserListView` | user lookup | worklist/assignment/audit/client profile | filters and pickers | authenticated | indirect | MATCHED_E2E | none |
| BE-06 | GET | `/api/admin/dashboard/` | `AdminDashboardView` | admin summary | `/admin` | dashboard load | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-07 | GET | `/api/admin/masters/<key>/` | `MasterValueListCreateView.get` | list masters | `/admin/masters/*` | table load | ADMIN/LEAD | indirect | MATCHED_E2E | none |
| BE-08 | POST | `/api/admin/masters/<key>/` | `MasterValueListCreateView.post` | create master | `/admin/masters/*` | `Add` | ADMIN/LEAD | indirect | MATCHED_E2E | none |
| BE-09 | PATCH | `/api/admin/masters/<key>/<pk>/` | `MasterValueUpdateView` | edit master | none visible | none | n/a | no | BACKEND_ONLY | add edit controls or remove from completeness claims |
| BE-10 | GET | `/api/admin/users/` | `AdminUsersView` | admin users list | `/admin/users` | table load | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-11 | PATCH | `/api/admin/users/<pk>/` | `AdminUserUpdateView` | update user | `/admin/users` | role/status selects | ADMIN/LEAD | indirect | MATCHED_E2E | none |
| BE-12 | GET | `/api/audit/` | `AuditLogView` | audit query | `/admin/audit` | filter view | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-13 | GET | `/api/admin/overrides/` | `ReopenOverridesView` | override history | `/admin/overrides` | history table | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-14 | POST | `/api/admin/import/validate-framework/` | validate view | import validate | `/admin/frameworks`, `/admin/import-logs` | validate actions | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-15 | GET | `/api/admin/import/logs/` | import logs | import log list | `/admin/import-logs`, admin dashboard link | table load | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-16 | GET | `/api/client-profiles/` | list client profiles | client profile list | admin client profiles, create/edit project/client forms | table and selects | ADMIN/LEAD | indirect | MATCHED_E2E | none |
| BE-17 | POST | `/api/client-profiles/` | create client profile | create profile | `/admin/client-profiles`; also project client-profile page exposes form | modal/form | ADMIN/LEAD backend | indirect | ROLE_MISMATCH | gate project route writes or convert to read-only for non-admin |
| BE-18 | GET | `/api/client-profiles/<pk>/` | profile detail | profile detail | `/projects/:id/client-profile` | page load | visible to all authenticated route users | indirect | ROLE_MISMATCH | route is broader than backend read permission |
| BE-19 | PATCH | `/api/client-profiles/<pk>/` | update profile | edit profile | `/admin/client-profiles`; also project route | form submit | ADMIN/LEAD backend | indirect | ROLE_MISMATCH | gate project route |
| BE-20 | POST | `/api/client-profiles/<pk>/variables-preview/` | preview vars | preview text | `/admin/client-profiles`; also project route | `Preview replacement` | ADMIN/LEAD backend | indirect | ROLE_MISMATCH | gate project route |
| BE-21 | GET | `/api/projects/` | project list | project register | `/projects` | register load | authenticated | yes | MATCHED_E2E | none |
| BE-22 | POST | `/api/projects/` | create project | create project | `/projects` | create form | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-23 | GET | `/api/frameworks/` | framework list | framework lookup | project create/manage, projects list, e2e helpers | selects | authenticated | yes | MATCHED_E2E | none |
| BE-24 | GET | `/api/frameworks/template/` | template view | CSV template | `/admin/frameworks` | `Download template` | ADMIN/LEAD in practice | indirect | MATCHED_E2E | none |
| BE-25 | GET | `/api/frameworks/<id>/export/` | export view | CSV export | `/admin/frameworks` | `Download export CSV` | ADMIN/LEAD in practice | indirect | MATCHED_E2E | none |
| BE-26 | GET | `/api/frameworks/<id>/analysis/` | analysis view | framework analytics | `/frameworks/:id/analysis` | analysis page from admin frameworks link | ADMIN/LEAD in practice | indirect | MATCHED_E2E | none |
| BE-27 | GET | `/api/admin/frameworks/` | admin framework list | admin framework list | `/admin/frameworks` | page load | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-28 | POST | `/api/admin/frameworks/` | admin framework create | create framework | `/admin/frameworks` | form submit | ADMIN/LEAD | indirect | MATCHED_E2E | none |
| BE-29 | POST | `/api/admin/frameworks/import/` | import create | import checklist | `/admin/frameworks` | `Run import` | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-30 | GET | `/api/projects/<pk>/` | project detail | project detail | multiple project routes/topbar | route load | authenticated | yes | MATCHED_E2E | none |
| BE-31 | PATCH | `/api/projects/<pk>/` | update project | update metadata | `/projects`, `/projects/:id` | manage forms | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-32 | DELETE | `/api/projects/<pk>/` | delete project | delete project | `/projects`, `/projects/:id` | manage forms | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-33 | POST | `/api/projects/<id>/initialize-from-framework/` | initialize project | initialize indicators | `/projects` create flow | create form optional step | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-34 | POST | `/api/projects/<id>/clone/` | clone project | clone scaffold | `/projects/:id` | clone modal | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-35 | GET | `/api/projects/<id>/readiness/` | readiness view | readiness metrics | readiness page, export history, print-pack | multiple pages | ADMIN/LEAD backend | yes | MATCHED_E2E | none |
| BE-36 | GET | `/api/projects/<id>/inspection-view/` | inspection view | MET-only pack | `/projects/:id/inspection` | inspection page | authenticated | yes | MATCHED_E2E | none |
| BE-37 | GET | `/api/projects/<id>/pre-inspection-check/` | pre-check | blockers | `/projects/:id/inspection` | inspection page | authenticated | yes | MATCHED_E2E | none |
| BE-38 | GET | `/api/projects/<id>/standards-progress/` | standards progress | progress metrics | project overview/worklist/standards route | multiple | authenticated | yes | MATCHED_E2E | none |
| BE-39 | GET | `/api/projects/<id>/areas-progress/` | areas progress | progress metrics | project overview/workspace/areas route | multiple | authenticated | yes | MATCHED_E2E | none |
| BE-40 | GET | `/api/dashboard/worklist/` | worklist view | worklist/filter | worklist, pending actions, overrides, workspace board | multiple | authenticated | yes | MATCHED_E2E | none |
| BE-41 | GET | `/api/project-indicators/<id>/` | indicator detail | full indicator detail | drawer and full detail route | drawer/page load | authenticated | yes | MATCHED_E2E | none |
| BE-42 | POST | `/api/project-indicators/<id>/assign/` | assign | assignment | full detail route | save assignment | LEAD/ADMIN | indirect | MATCHED_E2E | none |
| BE-43 | POST | `/api/project-indicators/<id>/update-working-state/` | update working state | notes/priority/due date | drawer and full detail | save working state | owner or lead/admin backend | indirect | ROLE_MISMATCH | frontend role check ignores assignment |
| BE-44 | POST | `/api/project-indicators/<id>/start/` | start | transition | drawer and full detail | start | owner or lead/admin backend | yes | ROLE_MISMATCH | same |
| BE-45 | POST | `/api/project-indicators/<id>/send-for-review/` | send review | transition | drawer and full detail | send for review | owner or lead/admin backend | yes | ROLE_MISMATCH | same |
| BE-46 | POST | `/api/project-indicators/<id>/mark-met/` | mark met | transition | drawer and full detail | mark met | approver or lead/admin backend | yes | ROLE_MISMATCH | same |
| BE-47 | POST | `/api/project-indicators/<id>/reopen/` | reopen | admin override | drawer, full detail, admin overrides | reopen/return/override | ADMIN backend | yes | ROLE_MISMATCH | admin overrides page is visible to LEAD too |
| BE-48 | GET | `/api/project-indicators/<id>/evidence/` | evidence list | evidence list | drawer/full detail | load evidence | authenticated | yes | MATCHED_E2E | none |
| BE-49 | GET | `/api/project-indicators/<id>/ai-outputs/` | AI outputs list | AI output history | full detail, drawer summary count | load outputs | authenticated | yes | MATCHED_E2E | none |
| BE-50 | POST | `/api/evidence/` | evidence create | add evidence | drawer/full detail | add evidence | owner or lead/admin backend | yes | ROLE_MISMATCH | frontend role check ignores assignment |
| BE-51 | POST | `/api/evidence/<id>/update/` | evidence update | edit evidence | full detail | edit evidence | owner or lead/admin backend | indirect | ROLE_MISMATCH | same |
| BE-52 | POST | `/api/evidence/<id>/review/` | evidence review | review evidence | drawer/full detail | save review | reviewer/approver/lead/admin backend, assignment-aware | yes | ROLE_MISMATCH | frontend check ignores assignment |
| BE-53 | GET | `/api/recurring/queue/` | recurring queue | due/overdue list | recurring page | table load | authenticated | yes | MATCHED_E2E | none |
| BE-54 | POST | `/api/recurring/instances/<id>/submit/` | recurring submit | submit recurring | recurring page, drawer, full detail | submit actions | owner or lead/admin backend | yes | ROLE_MISMATCH | frontend submit buttons not assignment-aware |
| BE-55 | POST | `/api/recurring/instances/<id>/approve/` | recurring approve | approve recurring | drawer/full detail | approve instance | reviewer/approver/lead/admin backend, assignment-aware | yes | ROLE_MISMATCH | frontend check ignores assignment |
| BE-56 | POST | `/api/ai/generate/` | AI generate | create advisory output | full detail page only | generate guidance/draft/assessment | owner or lead/admin backend, assignment-aware | yes | INVISIBLE_UI | surface from main worklist or add link into full detail |
| BE-57 | POST | `/api/ai/outputs/<id>/accept/` | AI accept | accept advisory output | full detail page only | accept output | owner or lead/admin backend, assignment-aware | yes | INVISIBLE_UI | same |
| BE-58 | GET | `/api/exports/projects/<id>/excel/` | excel payload | preview payload | project overview | generate excel | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-59 | GET | `/api/exports/projects/<id>/print-bundle/` | print bundle payload | preview payload | project overview, print-pack page | generate print pack | backend ADMIN/LEAD | yes | ROLE_MISMATCH | add frontend role guard to print-pack page |
| BE-60 | GET | `/api/exports/projects/<id>/physical-retrieval/` | physical retrieval | preview payload | project overview, export history | physical retrieval | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-61 | GET | `/api/exports/projects/<id>/history/` | export history | job list | export history page | history table | ADMIN/LEAD | yes | MATCHED_E2E | none |
| BE-62 | POST | `/api/exports/projects/<id>/generate/` | export generate | create export job | export history page | generate buttons | ADMIN/LEAD | yes | MATCHED_E2E | none |
