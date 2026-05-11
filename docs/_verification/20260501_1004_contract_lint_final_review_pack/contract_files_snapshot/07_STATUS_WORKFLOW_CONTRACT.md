# Status Workflow Contract

Source of truth:
- Status choices: `apps/masters/choices.py` `ProjectIndicatorStatusChoices`
- Allowed transitions: `apps/workflow/transitions.py`

## Project Indicator Statuses

- `NOT_STARTED`
- `IN_PROGRESS`
- `UNDER_REVIEW`
- `MET`
- `BLOCKED`

## Allowed Transitions (enforced)

From `apps/workflow/transitions.py`:

| From | Allowed To |
|---|---|
| `NOT_STARTED` | `IN_PROGRESS`, `BLOCKED` |
| `IN_PROGRESS` | `UNDER_REVIEW`, `BLOCKED` |
| `UNDER_REVIEW` | `IN_PROGRESS`, `MET`, `BLOCKED` |
| `BLOCKED` | `IN_PROGRESS`, `UNDER_REVIEW` |
| `MET` | `IN_PROGRESS` |

Contract expectation:
- Frontend must only present actions that are valid transitions for the current status.
- Backend is authoritative and must reject invalid transitions.
