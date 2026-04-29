# UI Improvement Plan (Applied)

| Issue found | Improvement applied | Files changed | Expected UX benefit |
| --- | --- | --- | --- |
| Projects start path unclear | Added “Where to start” guidance and empty-state CTA | `projects-list-screen.tsx`, `empty-state.tsx` | First-time operators can identify entry action immediately |
| Silent disabled actions | Added role rationale for disabled actions | `projects-list-screen.tsx`, `project-overview-screen.tsx`, `indicator-detail-screen.tsx`, `project-export-history-screen.tsx` | Reduces “UI is broken” confusion |
| Project overview action overload | Grouped actions into workflow cards (Operate / Readiness / Export) + next-step guidance | `project-overview-screen.tsx` | Faster orientation and less action-scanning fatigue |
| Over-filtered worklist dead-end | Added clear/reset filter actions and usage guidance | `project-worklist-screen.tsx` | Easier recovery to full queue |
| Recurring evidence ID usability | Added evidence selector dropdown when evidence exists | `project-recurring-screen.tsx` | Lower data-entry friction and fewer ID errors |
| Inspection/readiness not actionable | Added remediation links to worklist/recurring | `project-inspection-screen.tsx`, `project-readiness-screen.tsx` | Better diagnosis-to-action flow |
| Navigation grouping weak | Sidebar grouped into Operational/Current project/Admin and role context | `sidebar.tsx` | Stronger IA and route discoverability |
| Role context implicit | Role shown in topbar identity chip | `topbar.tsx` | Better permission expectation setting |
| Admin route cross-navigation weak | Added Overrides shortcut and richer headers | `admin-dashboard-screen.tsx`, `admin-overrides-screen.tsx`, `admin-audit-screen.tsx`, `admin-users-screen.tsx`, `admin-masters-screen.tsx` | Faster governance navigation |
| Health page too raw | Added summarized health metrics + retained raw payload | `system-health-screen.tsx` | Faster operational scanability |

## Regression stabilization performed
- Fixed runtime hook-order crash on project overview by stabilizing hook call order.
- Updated unit tests for changed labels/context.
