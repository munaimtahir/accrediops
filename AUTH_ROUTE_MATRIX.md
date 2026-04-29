# Auth Route Matrix

| Route pattern | Classification | Logged-out behavior | Authenticated behavior | Role-restriction behavior |
|---|---|---|---|---|
| `/login` | Public | Render login page | Render login page | N/A |
| `/healthz` | Public | Accessible | Accessible | N/A |
| `/` | Entry redirect | Redirect chain ends at protected route guard | Redirect to `/projects` | N/A |
| `/projects`, `/projects/*` | Protected | `307` → `/login?next=...` | Allowed | Endpoint-level RBAC where applicable |
| `/project-indicators/*` | Protected | `307` → `/login?next=...` | Allowed | Endpoint/workflow permission checks |
| `/frameworks/*` | Protected | `307` → `/login?next=...` | Allowed | Endpoint-level RBAC where applicable |
| `/admin`, `/admin/*` (workbench admin UI) | Protected | `307` → `/login?next=...` | Allowed to route entry | Frontend guard + discoverability aligned to ADMIN/LEAD; backend API still authoritative |
| `/django-admin/*` (Django admin) | Backend-admin route | Redirect/login at Django admin | Django admin session flow | Django admin auth/permissions |
| `/admin/` | Django admin alias | `308` → `/django-admin/` | `308` → `/django-admin/` | N/A |

## Canonical strategy
- Primary guard: **server-side middleware route gate**.
- Secondary guard: **client AuthGuard**.
- Discoverability/capability checks: **`frontend/lib/authz.ts`** (single frontend role/capability truth for touched admin/readiness/export surfaces).
- API fallback: centralized **401 handling** that clears stale auth state and routes to login with `next`.
