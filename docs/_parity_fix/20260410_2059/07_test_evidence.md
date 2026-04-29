# 07 Test Evidence

> Historical snapshot before runtime-port reassignment. Current canonical local origin is `http://127.0.0.1:18080`.

## Frontend unit/integration (Vitest)
**Result:** PASS

Command:
- `cd frontend && npm test -- --run`

Summary:
- Test Files: `24 passed`
- Tests: `47 passed`

Parity-relevant coverage includes:
- `frontend/tests/authz.test.ts`
- `frontend/tests/use-admin.test.tsx`
- `frontend/tests/admin-import-logs-screen.test.tsx`
- `frontend/tests/admin-area-guard.test.tsx`
- `frontend/tests/sidebar.test.tsx`
- `frontend/tests/project-overview-screen.test.tsx`
- `frontend/tests/readiness-screen.test.tsx`
- `frontend/tests/export-history-screen.test.tsx`
- `frontend/tests/project-list-screen.test.tsx`

## Playwright live-stack checks (targeted parity specs)
**Result:** FAIL in current environment

Command:
- `cd frontend && npm run test:e2e -- tests/e2e/role-visibility.spec.ts tests/e2e/admin-import-validation.spec.ts`

Observed failures:
- `5 failed`
- Failures occur during authenticated flow expectations because navigation remains on `http://127.0.0.1:8080/login` rather than expected AccrediOps `/projects` post-login route.

Parity-relevant E2E files added/updated:
- `frontend/tests/e2e/admin-import-validation.spec.ts`
- `frontend/tests/e2e/role-visibility.spec.ts`
- `frontend/tests/e2e/cta-discoverability.spec.ts`
- `frontend/tests/e2e/core-journeys.spec.ts`

## Interpretation
- Test implementation coverage for required parity scenarios was added/updated.
- End-to-end pass confirmation is blocked by canonical host runtime collision on `localhost:8080` in this shared environment.
