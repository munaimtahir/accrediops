# 01 Gap Fixes

> Historical parity snapshot: runtime-port findings in this folder predate the canonical port reassignment to `18080`.

## Gap 1: Framework validation contract drift
**Status:** PASS (code parity fixed)

Frontend validation now uses `multipart/form-data` with `project_id` + `file` (no legacy JSON fallback path).

**Key files changed**
- `frontend/lib/hooks/use-admin.ts`
- `frontend/lib/framework-import.ts`
- `frontend/components/screens/admin-import-logs-screen.tsx`
- `frontend/lib/hooks/use-framework-management.ts`

**Behavior changes**
- Validate action is disabled until project and file are selected.
- Inline disabled reason is shown when prerequisites are missing.
- Structured validation success and error output are rendered.
- Legacy `{ file_name, rows }` request path removed from this flow.

## Gap 2: LEAD admin discoverability
**Status:** PASS (frontend discoverability aligned)

LEAD visibility for admin navigation is now aligned with backend ADMIN/LEAD authority, and role checks are centralized through authz helpers.

**Key files changed**
- `frontend/lib/authz.ts`
- `frontend/components/layout/sidebar.tsx`
- `frontend/app/(workbench)/admin/layout.tsx`
- `frontend/components/providers/admin-area-guard.tsx`

## Gap 3: Readiness/export overexposure
**Status:** PASS (frontend exposure aligned)

Readiness/export discoverability and route-level guard behavior were aligned to ADMIN/LEAD authority to avoid predictable unauthorized dead-end navigation.

**Key files changed**
- `frontend/lib/authz.ts`
- `frontend/components/screens/project-overview-screen.tsx`
- `frontend/components/screens/project-readiness-screen.tsx`
- `frontend/components/screens/project-export-history-screen.tsx`
- `frontend/components/screens/project-inspection-screen.tsx`
- `frontend/components/screens/projects-list-screen.tsx`
