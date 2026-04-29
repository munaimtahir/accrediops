# Information Architecture Freeze (Operator-Primary)

## Primary Operator Navigation
1. `/projects` — card-first projects home (create/open/manage in role-aware form).
2. `/projects/[projectId]` — project workspace launchpad with pathway cards.
3. `/projects/[projectId]` workspace board — Area → Standard → Indicator card flow.
4. Indicator drawer — primary update surface (without route hop).
5. `/projects/[projectId]/exports` and `/projects/[projectId]/print-pack` — output surfaces.

## Secondary Operator Routes
- `/projects/[projectId]/worklist` — compact filtered queue, still drawer-enabled.
- `/projects/[projectId]/recurring`
- `/projects/[projectId]/inspection`
- `/projects/[projectId]/readiness`
- `/projects/[projectId]/areas-progress`
- `/projects/[projectId]/standards-progress`
- `/projects/[projectId]/client-profile`

## Support/Deep Detail Route
- `/project-indicators/[id]` remains available for full governance history/detail workflows.

## Admin-Secondary Routes
- `/admin`
- `/admin/overrides`
- `/admin/audit`
- `/admin/users`
- `/admin/system-health`
- `/admin/masters/*`

## Movement Model (Frozen)
Projects Home → Open Project → Select Area → Select Standard → Open Indicator Drawer → Execute Evidence/Recurring/Command Actions → Export/Print.

