# Frontend Realignment Plan (MVP Workbench)

## Objective
Realign frontend operator flow to MVP-style, card-first workbench UX while preserving existing backend governance, commands, auditability, and role controls.

## Audit Outcome

### Keep
- Existing backend-integrated mutations/hooks for evidence, recurring, and indicator command actions.
- Project-level governance controls (clone/manage/export access by role).
- Full indicator detail route as deeper support surface.
- Admin routes and audit surfaces.

### Simplify
- `/projects`: make card grid the primary register view with strong create/open affordances.
- `/projects/[projectId]`: clarify operator pathways and de-emphasize dense mixed actions.
- `/projects/[projectId]/worklist`: keep filter utility but make card interaction and in-context updates primary.

### Replace
- Route-hopping-first indicator updates with drawer-first updates from worklist/workspace cards.
- Dense first-impression project browsing with card-first project home.

### De-emphasize
- Table-first/power workflows (kept as optional "Power view" on projects page).
- Admin-heavy context in day-to-day operator paths.

### Move into Drawer
- Indicator update actions (summary, evidence, recurring, notes, review context, command actions).
- Evidence add/review and recurring submit/approve as in-place drawer subflows.

### Keep as Admin-Secondary
- `/admin`, `/admin/overrides`, `/admin/audit`, `/admin/users`, `/admin/system-health`, masters.
- Governance and audit remain available by role but outside primary operator path.

