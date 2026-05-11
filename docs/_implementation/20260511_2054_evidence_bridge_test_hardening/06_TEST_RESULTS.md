# Test Results

## Backend verification

| Command | Result | Notes |
|---|---|---|
| `.venv/bin/python -m py_compile apps/ai_actions/services/document_drafting.py` | PASS | Syntax check completed successfully |
| `.venv/bin/python manage.py check` | PASS | No issues identified |
| `.venv/bin/python manage.py makemigrations --check --dry-run` | PASS | No changes detected |
| `.venv/bin/python manage.py migrate` | PASS | No migrations to apply |
| `.venv/bin/python -m pytest apps/api/tests/test_print_pack.py apps/api/tests/test_evidence_pack.py apps/api/tests/test_admin_readiness_inspection_exports.py apps/api/tests/test_indicator_classification.py -q` | PASS | 28 passed |

## Frontend verification

| Command | Result | Notes |
|---|---|---|
| `cd frontend && npm run lint` | PASS WITH WARNINGS | 2 unused-variable warnings |
| `cd frontend && npm run typecheck` | PASS | TypeScript clean |
| `cd frontend && npm run build` | PASS | Production build succeeded |
| `cd frontend && npm test` | PASS | Vitest: 28 files / 54 tests passed |

## E2E verification

| Command | Result | Notes |
|---|---|---|
| `docker compose ps` | PASS | backend, frontend, and caddy were running and healthy |
| `cd frontend && npx playwright test` | PARTIAL | 78 passed, 2 failed |

### Playwright failures

- `tests/e2e/01_lab_framework_integrity.spec.ts`
- `tests/e2e/15_smoke_clean_new_app_mode.spec.ts`

Root cause:

- Those tests assert exactly one framework exists.
- The environment currently has 3 frameworks:
  - `PHC LAB`
  - `TmpFw`
  - `TmpFw2`

