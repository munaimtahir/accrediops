# 04 — Feature Inventory

Status buckets:
- **WORKING**
- **WORKING BUT HIDDEN**
- **WORKING BUT CONFUSING**
- **PARTIALLY IMPLEMENTED**
- **MISSING UI**
- **MISSING BACKEND**

| Feature | Inventory status | Notes |
|---|---|---|
| Login/logout/session handling | WORKING | Stable; middleware + session API aligned |
| Project register list/open | WORKING | Core entrypoint operational |
| Create project CTA visibility | WORKING | Visible for all roles; disabled with rationale when restricted |
| Project create + initialize flow | WORKING BUT CONFUSING | Works; next action now surfaced in toast and context strip |
| Project clone flow | WORKING | Available to ADMIN/LEAD |
| Project manage/update/delete | WORKING | Mutation + API wired |
| Worklist filtering and grouping | WORKING | Area/standard/status/priority/owner filters functional |
| Pending actions printable view | WORKING | Functional and printable |
| Standards progress page | WORKING | Functional |
| Areas progress page | WORKING | Functional |
| Inspection mode | WORKING | Functional MET-focused view |
| Readiness page | WORKING | Role-gated with clear restriction messaging |
| Export history + generation | WORKING | Role-gated UI with explicit feedback |
| Indicator workbench top readiness state | WORKING | Explicit readiness banner + next action |
| Indicator summary context | WORKING | Indicator metadata and assignment context available |
| Indicator required evidence checklist | WORKING | Added explicit checklist section |
| Indicator primary actions (start/review/approve/return/reopen) | WORKING | All exposed and role-gated visibly |
| Indicator evidence add/edit/review | WORKING | Fully surfaced |
| Indicator recurring submit/approve | WORKING | Fully surfaced |
| Indicator AI advisory flow | WORKING | Generate/accept advisory outputs functional |
| Indicator governance/audit trail | WORKING | Transition + audit summaries visible |
| Admin dashboard links (audit/overrides/import/framework controls) | WORKING | Visible for all users; restricted users see disabled rationale |
| Admin audit screen | WORKING | Functional filters + data table |
| Admin overrides screen | WORKING BUT CONFUSING | History-only; no direct action execution by design |
| Framework import validate/create | WORKING | Validation + import + logs wired |
| Framework analysis route | WORKING | Linked from admin frameworks |
| Global status legend and semantics | WORKING | Topbar/global legend with tooltip semantics |
| Next action engine consistency across core screens | PARTIALLY IMPLEMENTED | Implemented via workflow strip + key banners; some low-traffic pages still rely only on contextual text |
| Endpoint-level authorization consistency for some non-admin reads | PARTIALLY IMPLEMENTED | Some routes rely primarily on service-layer checks |
| Role-aware disabled navigation entries | WORKING | Implemented in sidebar for admin/readiness/exports |

## Missing core surfaces after this sprint

- **MISSING UI**: None identified for required core controls (create project, indicator actions, admin controls, exports/readiness entries).
- **MISSING BACKEND**: No core workflow API missing for required journeys.
