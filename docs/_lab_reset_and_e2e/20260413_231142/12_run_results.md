# 12 Run results

## Runtime checks

- `scripts/devops/status_check.sh` ✅
- `scripts/devops/smoke_verify.sh` ✅

Verified routes on `http://127.0.0.1:18080`:
- `/`
- `/health/frontend`
- `/health/backend`
- `/api/health/`
- `/projects`
- `/api/auth/session/`
- `/api/projects/`

## Backend regression

- `cd backend && python3 manage.py test apps.api.tests.test_admin_readiness_inspection_exports --noinput` ✅

## Frontend unit tests

- `cd frontend && npm test -- --run` ✅
- Result: **24 test files passed, 47 tests passed**

## Playwright setup

- `cd frontend && npx playwright install` ✅

## Full authenticated E2E

- `cd frontend && npm run test:e2e` ✅
- Result: **22 passed / 0 failed**
- Artifacts:
  - `OUT/playwright/`
  - `playwright-report/`
  - JSON reporter: `OUT/playwright/results.json`
