# Permission Matrix Hardening

## Sensitive actions validated
- Create project
- Initialize project
- Reopen override decision
- Evidence review approval
- Recurring submit / recurring approve
- Admin routes
- Export generate/history

## Backend enforcement status (verified)
- Create/initialize: `ADMIN`/`LEAD` only.
- Reopen override: `ADMIN` only.
- Evidence review: reviewer-access path only (`ADMIN`/`LEAD`/assigned `REVIEWER`/`APPROVER` rules).
- Recurring submit: owner-access path only.
- Recurring approve: reviewer-access path only.
- Admin routes and export generate/history: `ADMIN`/`LEAD` only.

## Frontend gating hardening
- Sidebar:
  - admin routes hidden for non-admin/non-lead users
  - project export history link hidden for non-admin/non-lead users
- Indicator detail:
  - reopen button remains ADMIN-only
  - AI controls disabled for non-owner-equivalent roles
- Export history screen:
  - generate/physical retrieval controls disabled for unauthorized roles
  - explicit denial toast on unauthorized action attempts

## Allow + deny test coverage added
- Backend (`test_governance_hardening.py`):
  - admin allow + lead deny for reopen
  - admin allow + owner deny for export generate/history
  - reviewer allow + owner deny for evidence review
  - owner allow + reviewer deny for recurring submit
  - reviewer allow + owner deny for recurring approve
- E2E:
  - non-admin cannot reopen (UI disabled + admin route denied)
  - non-admin cannot use export history route/action (permission denial surfaced)

## Matrix summary
- **Allow paths**: ADMIN/LEAD governance operations and role-correct evidence/recurring operations are verified.
- **Deny paths**: unauthorized role attempts now explicitly tested and asserted (403/error UX + disabled UI paths).

