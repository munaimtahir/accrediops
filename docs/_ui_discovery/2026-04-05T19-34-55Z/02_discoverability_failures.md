# Discoverability Failures

| Feature | Expected location | Previous behavior | Current status | Severity |
| --- | --- | --- | --- | --- |
| Create Project | `/projects` top-level page | Present but no first-step guidance/empty-state CTA | Added start guidance + empty-state CTA | Critical |
| Manage Project | `/projects` list action | Disabled silently for non-privileged roles | Added role rationale on disabled action | High |
| Project execution path | `/projects/[id]` | Too many equivalent CTAs, weak hierarchy | Re-grouped into explicit action cards | Critical |
| Export workflow entry | `/projects/[id]` and `/projects/[id]/exports` | Available but mixed framing and role clarity | Added grouped export actions and role-aware descriptions | High |
| Recurring evidence linking | `/projects/[id]/recurring` submit modal | Numeric ID input only | Added evidence dropdown when available | High |
| Readiness/inspection remediation | `/projects/[id]/readiness`, `/inspection` | Status presented, next action unclear | Added direct links to remediation surfaces | High |
| Worklist reset path | `/projects/[id]/worklist` | No one-click way to recover from over-filtering | Added clear filters + reset CTA | Medium |
| Admin route grouping | Sidebar | Operational and admin contexts blended | Added section grouping and role context | High |
| Role context visibility | Global navigation | Current role not clearly visible in shell | Added “Viewing as ROLE” sidebar context and role in topbar chip | Medium |

## Items reviewed and confirmed already discoverable
- Clone Project (project overview)
- Initialize from Framework (create form flow)
- Print Pack preview/generation
- Client profile linking route
- Evidence add/review controls
- Admin override and audit routes (for authorized users)
