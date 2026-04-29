# 03 Next Action Coverage

## Reusable Component

`<NextActionBanner>` is now the shared action-guidance component.

It standardizes:

- `Action`
- `Reason`
- `Status`
- `Cannot proceed because` blockers

## Screen Coverage

| Screen | Coverage |
| --- | --- |
| Project overview | Replaced passive next-step box with action/reason/status and role/export blockers. |
| Project worklist | Replaced passive usage text with worklist-driven next action. |
| Indicator detail | Replaced readiness summary box with guided action/reason/status plus workflow blockers. |
| Project recurring | Replaced passive queue instructions with due/overdue action guidance. |
| Project readiness | Added readiness-specific next action and explicit blockers. |
| Export history | Added export readiness guidance and blocker explanations. |
| Print pack preview | Added governed export guidance and blocker explanations. |
| Admin overrides | Added execution guidance plus explicit preconditions. |

## Operator Outcome

- Every target screen now answers: what to do next, why, and whether current state blocks the action.
- Passive info-only states were reduced on the target trust surfaces.
- Disabled export/override actions are backed by visible blocker reasons.
