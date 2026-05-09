# Phase 1 — Baseline Recheck

## Baseline Verification Results

| Area | Result | Details |
|---|---|---|
| Backend check | PASS | System check identified no issues. |
| Migration check | PASS | No changes detected. |
| Backend tests | PASS | 137 passed. |
| Backend coverage | 82% | Verified with pytest-cov. |
| Frontend lint | FAIL | 1 error, 1 warning in `frontend/tests/e2e/helpers.ts`. |
| Frontend typecheck | PASS | `tsc --noEmit` passed. |
| Frontend unit tests | PASS | 53 passed. |
| Frontend build | PASS | `next build` successful. |
| Docker health | PASS | Containers are Up and Healthy. Health endpoints verified. |
| Playwright full run | FAIL | 76 passed, 2 failed, 2 flaky. |

## Playwright Detailed Results

- **Total tests**: 80
- **Passed**: 76
- **Failed**: 2
- **Flaky**: 2
- **Skipped**: 0

### Failing Tests List:

1. `tests/e2e/core-journeys.spec.ts:174:7` › `admin override reopens met indicator and audit evidence is visible`
   - **Error**: `expect(typeof metIndicatorId).toBe("number")` received `undefined`.
2. `tests/e2e/workflow-guidance.spec.ts:17:7` › `worklist and recurring screens provide action guidance`
   - **Error**: `getByRole('heading', { name: 'Recurring queue' })` not found.

### Flaky Tests List (Passed on retry):

1. `tests/e2e/app-flows.spec.ts:51:7` › `post-login operational journey route opens from project home`
2. `tests/e2e/core-journeys.spec.ts:212:7` › `non-admin user cannot reopen met indicator`

## Comparison with Previous Sprint Baseline

The previous sprint reported 52 passed, 27 failed, and 1 flaky.
The current baseline of **76 passed** represents a significant improvement, likely due to uncommitted fixes from the previous agent. However, 2 failures and 2 flaky tests remain, which will be the focus of this sprint.
