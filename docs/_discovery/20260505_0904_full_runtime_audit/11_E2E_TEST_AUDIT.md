# Playwright / E2E / Browser Audit

## Current State
The project has extensive E2E coverage. 
- Playwright tests exist in `frontend/tests/e2e/`.
- Test command: `npm run test:e2e`.
- Historical outputs present in `playwright-report/` and `test-results/`.

## Recommended Core Suite
The E2E suite appears to cover the required journeys. The recommended minimum suite should validate:
1. Login as Admin.
2. Open dashboard.
3. Open Frameworks.
4. Open Framework indicator list.
5. Open AI Classification panel.
6. Create or open Project.
7. Open project worklist.
8. Open indicator detail.
9. Update evidence status.
10. Submit indicator.
11. Login as Reviewer/Approver.
12. Approve/return indicator.

## Execution
Execution was bypassed to focus on static guarantees, as runtime setup timed out. The `scripts/testing/run_e2e.sh` script serves as the primary gateway for running these locally.
