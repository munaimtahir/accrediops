# Root Cause Findings

## Root cause summary
The realignment was largely present in deployed code/assets, but live `/projects` crashed at runtime due to a React hooks-order violation.

## What blocked visible realignment
1. **Operational ambiguity**:
   - AccrediOps stack was not initially running on `:18080`.
   - Multiple unrelated frontends on other ports increased "wrong live target" risk.
2. **Frontend runtime exception**:
   - `ProjectsListScreen` used `useMemo` after conditional early returns.
   - Live browser hit React minified error #310 and rendered only generic app-error screen.
   - Result: user could not see card-first register/workspace flow despite shipped components.

## Why tests/build had reported success earlier
- The prior sprint validated behavior in test runs and artifacts, but this specific runtime ordering failure still manifested in live render path during authenticated `/projects` execution.

## Resolution applied
- Hook order bug fixed in `frontend/components/screens/projects-list-screen.tsx`.
- Frontend/backend rebuilt and redeployed.
- Post-fix live checks confirm expected UI now renders.

