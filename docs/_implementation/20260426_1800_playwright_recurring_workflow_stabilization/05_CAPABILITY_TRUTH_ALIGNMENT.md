# Capability-Driven UI Truth Alignment

## Summary
Audited the recurring queue and project dashboard to ensure all user-facing actions are driven by backend capability flags, rather than frontend-only role inferences.

## Action Matrix

| Area | Action | Source of Truth | Frontend Behavior |
|------|--------|-----------------|-------------------|
| Recurring Queue | Submit | `row.capabilities.can_submit` | Enabled only for assigned owner/admin. |
| Recurring Queue | Approve | `row.capabilities.can_approve` | Enabled only for assigned reviewer/approver/admin. |
| Dashboard | Open Review | `role` (Admin/Lead/Reviewer/Approver) | Group-level visibility for inspection mode. |
| Dashboard | Open Settings | `canAccessAdminArea(user)` | Visible only for Admin/Lead. |

## Refinements
- **Numeric ID Guard:** The Sidebar now robustly extracts the `projectId` from the URL, ensuring that project-specific links are only generated when a valid project context exists. This prevents the "projects-as-id" bug that caused invalid API calls.
- **Backend Authoritative:** All recurring actions now use the same backend permission logic that gates the actual API endpoints, ensuring zero mismatch between UI availability and API success.
