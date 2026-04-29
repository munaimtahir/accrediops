# 07 Test Results

## Frontend unit/integration
- Command: `cd frontend && npm test -- --run`
- Result: **PASS**
- Summary: `24` test files passed, `47` tests passed.

## Targeted Playwright parity suite
- Command:
  - `cd frontend && npm run test:e2e -- tests/e2e/role-visibility.spec.ts tests/e2e/admin-import-validation.spec.ts tests/e2e/cta-discoverability.spec.ts tests/e2e/core-journeys.spec.ts`
- Result: **FAIL**
- Summary:
  - `8` passed
  - `10` failed

## Failure profile (port-independent behavior/test issues)
- Role visibility assertions (e.g., admin nav text expectations for LEAD).
- Strict locator collisions for readiness button assertions.
- Multiple core-journey/auth-seeded E2E paths failing in current test state.
