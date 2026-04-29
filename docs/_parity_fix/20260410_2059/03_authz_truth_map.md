# 03 Authz Truth Map

> Historical parity snapshot: authz findings remain valid; runtime port has since been reassigned to `18080`.

Shared frontend authz source introduced at:
- `frontend/lib/authz.ts`

## Capability mapping

| Capability helper | Allowed roles | Primary usage |
|---|---|---|
| `canAccessAdminArea(user)` | ADMIN, LEAD | Sidebar admin discoverability, admin route guard |
| `canCreateProject(user)` | ADMIN, LEAD | Projects list/create CTA discoverability |
| `canViewReadiness(user)` | ADMIN, LEAD | Overview CTA, readiness route guard, inspection link visibility |
| `canViewExports(user)` | ADMIN, LEAD | Overview CTA, export-history route guard |
| `canValidateFrameworkImport(user)` | ADMIN, LEAD | Admin framework import validation actions |
| `getRestrictionMessage(feature)` | n/a | Consistent disabled/restricted messaging |

## Frontend integration points
- Sidebar/nav discoverability:
  - `frontend/components/layout/sidebar.tsx`
- Admin route protection:
  - `frontend/app/(workbench)/admin/layout.tsx`
  - `frontend/components/providers/admin-area-guard.tsx`
- Project/action discoverability:
  - `frontend/components/screens/project-overview-screen.tsx`
  - `frontend/components/screens/projects-list-screen.tsx`
  - `frontend/components/screens/project-inspection-screen.tsx`
- Restricted route UX (no predictable 403 trap):
  - `frontend/components/screens/project-readiness-screen.tsx`
  - `frontend/components/screens/project-export-history-screen.tsx`

## Governance outcome
- Raw/scattered role string checks for the touched parity surfaces were replaced with centralized helper usage.
- Frontend discoverability is now aligned to backend ADMIN/LEAD governance truth for admin/readiness/export surfaces.
