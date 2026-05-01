# RBAC Capability Contract

Source of truth:
- Backend permissions: `apps/workflow/permissions.py`, `apps/api/views/*` permission classes (not exhaustively listed here).
- Roles: `apps/masters/choices.py` `RoleChoices`

Roles:
- `ADMIN`, `LEAD`, `OWNER`, `REVIEWER`, `APPROVER`

Contract summary (high-level):

| Capability | ADMIN | LEAD | OWNER | REVIEWER | APPROVER | Evidence |
|---|---:|---:|---:|---:|---:|---|
| Access admin endpoints (admin screens) | ✅ | ✅ | ❌ | ❌ | ❌ | `AdminOrLeadPermission` used on many admin views |
| Create/update/delete projects | ✅ | ✅ | ❌ | ❌ | ❌ | `ensure_admin_or_lead_access` in `apps/projects/services.py` |
| Assign PI roles | ✅ | ✅ | ❌ | ❌ | ❌ | `ProjectIndicatorAssignView` service-layer permission checks |
| Update PI working notes/state | ✅ | ✅ | ✅ (assigned owner) | ❌ | ❌ | `ensure_project_owner_access` |
| Send PI for review | ✅ | ✅ | ✅ (assigned owner) | ❌ | ❌ | `send_project_indicator_for_review` service |
| Review evidence | ✅ | ✅ | ❌ | ✅ | ❌ | evidence review expects reviewer role (service-layer) |
| Mark PI met | ✅ | ✅ | ❌ | ❌ | ✅ | approver required (service-layer) |
| Reopen PI | ✅ | ❌ | ❌ | ❌ | ❌ | admin-only for reopen (service-layer) |
| Run framework classification | ✅ | ✅ | ❌ | ❌ | ❌ | admin endpoints gated |
| Bulk approve classifications | ✅ | ✅ | ❌ | ❌ | ❌ | admin endpoints gated |
| Generate document drafts | ✅ | ✅ | ❌ | ❌ | ❌ | admin endpoints gated |

Note: This is a contract summary; fine-grained rules must remain enforced in backend services.
