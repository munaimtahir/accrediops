# Live Feature Presence Matrix

Classification key: LIVE AND VERIFIED / IMPLEMENTED BUT NOT DEPLOYED / PARTIALLY LIVE / MISSING / BLOCKED BY DEPLOYMENT ISSUE

| Surface | Expected | Initial observation | Post-fix observation | Classification |
|---|---|---|---|---|
| `/projects` card-first | Project cards primary | Blocked by runtime app error | `Project register`, project cards and `Open project` visible | LIVE AND VERIFIED |
| `/projects` create/open affordances | Create + Open prominent | Blocked by runtime app error | `Create project` + `Open project` visible | LIVE AND VERIFIED |
| `/projects` power table secondary | Hidden until toggle | Blocked by runtime app error | Hidden by default; `Show power table` present | LIVE AND VERIFIED |
| Workspace hierarchy on project page | Areas / Standards / Indicators | Not reachable due `/projects` crash | All three headings visible | LIVE AND VERIFIED |
| Indicator drawer interaction | In-context drawer opens | Not reachable due `/projects` crash | Drawer opens with `Indicator workbench` | LIVE AND VERIFIED |
| Drawer section set | Summary/Evidence/Recurring/Notes/Review/Actions | Not reachable due `/projects` crash | All section tabs present | LIVE AND VERIFIED |
| Admin secondary posture | Primary flow not admin-led | N/A during crash | Primary flow now clearly project/workspace-first | LIVE AND VERIFIED |
| Role-gated states | Disabled/hint behavior | Not observable during crash | Behavior present in live checks and existing tests | LIVE AND VERIFIED |

