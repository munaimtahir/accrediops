# 02 Export Guard Rules

## Guard Engine

Exports now call a shared backend eligibility engine before any preview payload or export job is created.

## Blocking Rules

An export is blocked when any of the following are true:

1. At least one project indicator is not `MET`.
2. At least one project indicator is flagged as high risk.
3. Recurring compliance is below `100%`.
4. Export validation warnings still exist:
   missing approved evidence, non-approved current evidence, or overdue recurring items.

## Backend Behavior

- Restricted export endpoints are protected with `AdminOrLeadPermission`.
- The eligibility engine raises `403` with a message starting `Export blocked: ...`.
- `GET /excel`, `GET /print-bundle`, `GET /physical-retrieval`, and `POST /generate` all use the same guard path.

## Audit Trail

- Export preview actions log `export.preview_generated`.
- Export job creation logs `export.job_created`.
- Audit payload includes `project_id` and `export_type`.
- `ExportJob` still records `created_by`, `project`, `type`, and `created_at`.

## UI Alignment

- Export history screen shows blockers before generation.
- Print-pack preview screen shows the same blocker logic before generation.
- Disabled export controls now explain why the action is blocked instead of failing silently.
