# Test and Command Verification

| Command | Result | Key Output | Status | Notes |
|---|---|---|---|---|
| `.venv/bin/python -m py_compile apps/ai_actions/services/document_drafting.py` | PASS | No syntax errors | PASS | Correct interpreter path was required |
| `.venv/bin/python manage.py check` | PASS | `System check identified no issues (0 silenced).` | PASS | |
| `.venv/bin/python manage.py makemigrations --check --dry-run` | PASS | `No changes detected` | PASS | Migration drift repaired |
| `.venv/bin/python manage.py migrate` | PASS | `No migrations to apply.` | PASS | |
| `.venv/bin/python -m pytest apps/api/tests/test_print_pack.py apps/api/tests/test_evidence_pack.py apps/api/tests/test_admin_readiness_inspection_exports.py apps/api/tests/test_indicator_classification.py -q` | PASS | `28 passed` | PASS | Bridge-focused backend suite |
| `cd frontend && npm run lint` | PASS WITH WARNINGS | 2 unused-variable warnings | PASS | No errors |
| `cd frontend && npm run typecheck` | PASS | `tsc --noEmit` clean | PASS | |
| `cd frontend && npm run build` | PASS | Production build succeeded | PASS | |
| `cd frontend && npm test` | PASS | `28 passed` / `54 passed` | PASS | Vitest |
| `docker compose ps` | PASS | backend/frontend healthy; caddy up | PASS | Live stack available |
| `cd frontend && npx playwright test` | PARTIAL | `78 passed, 2 failed` | PARTIAL | Failures were stale framework-count assumptions |

