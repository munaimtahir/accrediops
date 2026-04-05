# Test Strategy from Truth Map

## Objective
Convert discovered feature truth into targeted verification so practical coverage is maximized without overstating completeness.

## Strategy by layer
1. **Backend**: focus on workflow commands, recurring transitions, AI advisory behavior, exports payload structure, permissions.
2. **Frontend**: screen rendering + critical action gating + empty/loading/error states.
3. **E2E**: route reachability plus operational flows where safe.

## Existing vs missing focus
- Existing strength: backend API tests for key business capabilities.
- Expanded in this pass: recurring approve path backend test, project overview UI role-gating test, broader Playwright route discoverability checks.
- Remaining missing: full browser flow assertions for create/init project, evidence review lifecycle, and clone/open success path.

## Priority mapping
1. P0: auth/login E2E stabilization and protected-route baseline.
2. P0: project create/init frontend + E2E coverage.
3. P1: deeper indicator/evidence recurring end-to-end scenarios.
4. P1: close low-coverage backend API view branches.
