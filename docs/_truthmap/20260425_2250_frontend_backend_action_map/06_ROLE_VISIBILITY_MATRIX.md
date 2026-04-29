# Role Visibility Matrix

| Page/Action | Admin | Lead | Focal Person | Reviewer | Approver | Backend Permission | Frontend Guard | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| Project register page | yes | yes | yes | yes | yes | authenticated | workbench auth guard only | MATCHED_E2E | `AuthGuard`, `/api/projects/` |
| Create project | yes | yes | no | no | no | ADMIN/LEAD | `canCreateProject` | MATCHED_E2E | `lib/authz.ts:15-17` |
| Admin sidebar area | yes | yes | disabled | disabled | disabled | ADMIN/LEAD for admin APIs | `canAccessAdminArea` | MATCHED_E2E | `sidebar.tsx:162-205` |
| Admin route access | yes | yes | restricted page | restricted page | restricted page | ADMIN/LEAD | `AdminAreaGuard` | MATCHED_E2E | `admin-area-guard.tsx:13-34` |
| Project readiness page | yes | yes | restricted page | restricted page | restricted page | ADMIN/LEAD | `canViewReadiness` | MATCHED_E2E | `project-readiness-screen.tsx:19-37` |
| Export history page | yes | yes | restricted page | restricted page | restricted page | ADMIN/LEAD | `canViewExports` | MATCHED_E2E | `project-export-history-screen.tsx:29-49` |
| Print pack page open | yes | yes | yes | yes | yes | backend export endpoint ADMIN/LEAD | no equivalent page guard | ROLE_MISMATCH | `project-print-pack-screen.tsx:48-61` |
| Project client-profile page open | yes | yes | yes | yes | yes | profile detail/write APIs ADMIN/LEAD | no page-role guard | ROLE_MISMATCH | `project-client-profile-screen.tsx:17-22,84-91` |
| Assign owner/reviewer/approver | yes | yes | no | no | no | ADMIN/LEAD | `canAssign` | MATCHED_E2E | `indicator-detail-screen.tsx:160-167,475-491` |
| Update working state | yes | yes | yes if OWNER role | no | no | assigned owner or LEAD/ADMIN | role-only check | ROLE_MISMATCH | backend `ensure_project_owner_access` vs frontend `role === OWNER` |
| Start indicator | yes | yes | yes if OWNER role | no | no | assigned owner or LEAD/ADMIN | role-only check | ROLE_MISMATCH | same |
| Send for review | yes | yes | yes if OWNER role | no | no | assigned owner or LEAD/ADMIN | role-only check | ROLE_MISMATCH | same |
| Review evidence | yes | yes | no | yes | yes | assigned reviewer or assigned approver or LEAD/ADMIN | role-only check | ROLE_MISMATCH | backend `ensure_project_reviewer_access` includes assignment |
| Approve recurring instance | yes | yes | no | yes | yes | assigned reviewer or approver or LEAD/ADMIN | role-only check | ROLE_MISMATCH | same |
| Mark as met | yes | yes | no | no | yes | assigned approver or LEAD/ADMIN | role-only check | ROLE_MISMATCH | backend `ensure_project_approver_access` |
| Reopen indicator | yes | no at backend | no | no | no | ADMIN only | admin overrides page visible to LEAD; button hidden elsewhere | ROLE_MISMATCH | `admin-overrides-screen.tsx` + backend permission |
| AI generate | yes | yes | yes if OWNER role | no | no | assigned owner or LEAD/ADMIN | `canAIActions = canOwnerActions` | ROLE_MISMATCH | `indicator-detail-screen.tsx:161-167,867-891` |
| AI accept | yes | yes | yes if OWNER role | no | no | assigned owner or LEAD/ADMIN | same | ROLE_MISMATCH | `indicator-detail-screen.tsx:918-926` |
| Framework import validate/run | yes | yes | no | no | no | ADMIN/LEAD | admin route + `canValidateFrameworkImport` | MATCHED_E2E | `admin-import-logs-screen.tsx:33-42` |
| Lab/LAB framework visibility | yes | yes | yes in project create if authenticated | yes | yes | authenticated for `/api/frameworks/` | no special role guard | MATCHED_E2E | `useFrameworks` and e2e LAB fixtures |

## Role notes

- "Department Focal Person" is not implemented as a distinct role string in this codebase. The nearest implemented role is `OWNER`.
- The dominant permission gap is not broad role type mismatch; it is assignment-awareness. Frontend checks role labels, backend checks role plus assigned user on the indicator.
