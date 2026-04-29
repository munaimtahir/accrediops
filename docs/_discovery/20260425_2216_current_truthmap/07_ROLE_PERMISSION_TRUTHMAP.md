# Role and Permission Truth Map

## A. Role Inventory

Roles are enforced via custom permissions and frontend layout guards.

| Role | Exists in Backend | Exists in Frontend | Permissions Defined | Status |
|---|---|---|---|---|
| Admin | Yes | Yes | Yes | COMPLETE |
| Accreditation Lead | Yes | Yes | Yes | COMPLETE |
| Department Focal Person | Yes | Yes | Yes | COMPLETE |
| Reviewer | Yes | Yes | Yes | COMPLETE |
| Approver | Yes | Yes | Yes | COMPLETE |

## B. Role-Feature Matrix

| Feature | Admin | Accreditation Lead | Department Focal Person | Reviewer | Approver |
|---|---|---|---|---|---|
| View Dashboard | Yes | Yes | Yes | Yes | Yes |
| Import Framework | Yes | Yes | No | No | No |
| Master Settings | Yes | No | No | No | No |
| Create Project | Yes | Yes | No | No | No |
| View Assigned Work | Yes | Yes | Yes | Yes | Yes |
| Submit Evidence | Yes | Yes | Yes | Yes | No |
| Review Evidence | Yes | Yes | No | Yes | No |
| Final Approval (Mark Met) | Yes | Yes | No | No | Yes |
| Generate Print Pack | Yes | Yes | No | No | No |

## C. Permission Enforcement Matrix

| Action | Backend Enforcement | Frontend Enforcement | Status |
|---|---|---|---|
| View admin dashboard | `AdminDashboardView` | `AdminAreaGuard` | COMPLETE |
| Update working state | `workflow_transition_is_allowed` | Action buttons hidden | COMPLETE |
| Submit for review | Service Logic | Action buttons hidden | COMPLETE |
| Mark Met | Service Logic | Action buttons hidden | COMPLETE |
| View framework template | Accessible to Lead+ | Visible to Lead+ | COMPLETE |
