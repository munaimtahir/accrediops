# Admin Governance Hardening

## Scope executed
- Verified admin governance routes and enforcement:
  - `/admin`
  - `/api/admin/overrides/`
  - `/api/audit/`
  - indicator reopen command: `/api/project-indicators/{id}/reopen/`
- Hardened frontend visibility and traceability for override/audit evidence.
- Added backend and E2E proofs for admin-allow and non-admin-deny paths.

## Actual override capability
- Override decision path is implemented through **reopen** command.
- Reopen is a forced state transition `MET -> IN_PROGRESS`.
- Reopen requires explicit reason and writes:
  - status history entry
  - audit event (`project_indicator.status_changed`)
- Admin overrides listing endpoint derives rows from audited status transitions with MET→IN_PROGRESS reasoned events.

## Enforcement verification
- Backend uses `ensure_admin_access` for reopen command.
- Verified:
  - ADMIN can reopen MET indicator (200)
  - LEAD is denied reopen (403)
  - audit + overrides endpoints include the reopen reason/event

## Frontend hardening changes
- Indicator detail now includes **Governance trail** section:
  - status transition history
  - recent audited actions
  - reason visibility for reopen and related actions
- Reopen action remains ADMIN-only and disabled for non-admin roles.

## Tests added/updated
- Backend:
  - `backend/apps/api/tests/test_governance_hardening.py`
    - `test_override_reopen_requires_admin_and_is_audited`
- E2E:
  - `frontend/tests/e2e/core-journeys.spec.ts`
    - `admin override reopens met indicator and audit evidence is visible`
    - `non-admin user cannot reopen met indicator`

## Result
- Override workflow is now enforceable, visible, and auditable with explicit allow/deny regression coverage.

