# Test and Command Verification

| Command | Result | Key Output | Status | Notes |
|---|---|---|---|---|
| `python -m py_compile backend/apps/ai_actions/services/document_drafting.py` | Passed | No syntax errors after importing `time` | PASS | Safe syntax correction verified. |
| `python manage.py check` | Passed | `System check identified no issues (0 silenced).` | PASS | Backend bootstrapping is healthy. |
| `python manage.py makemigrations --check --dry-run` | Failed | Pending migrations for `indicators.0005_evidencerequirementsuggestion.py` and `ai_actions.0006_evidencerequirementsuggestion.py` | FAIL | Migration drift remains. |
| `python manage.py showmigrations` | Passed | `indicators.0004` and `ai_actions.0005` are applied; no migration for the pending suggestion-model changes | PASS | Confirms the drift above. |
| `python manage.py migrate` | Passed with warning | No migrations to apply; Django warns that `ai_actions` and `indicators` have model changes not reflected in migrations | PARTIAL | Database is up, but model/migration sync is not clean. |
| `python -m pytest apps/api/tests/test_document_drafting.py -q` | Passed | `3 passed` | PASS | Draft generation path works after the import fix. |
| `python -m pytest apps/api/tests/test_print_pack.py apps/api/tests/test_evidence_pack.py apps/api/tests/test_admin_readiness_inspection_exports.py -q` | Failed | `3 failed, 10 passed` | FAIL | Print-pack, evidence-pack, and inspection paths still have regressions. |
| `npm run lint` | Passed with warnings | 2 unused-variable warnings in frontend tests | PASS | No lint errors. |
| `npm run typecheck` | Passed | TypeScript checks completed successfully | PASS | Frontend types are clean. |
| `npm run build` | Passed | Next.js build completed; route map generated | PASS | Frontend production build is healthy. |
| `npm test` | Passed | `28 passed (28)` / `54 passed (54)` | PASS | Frontend vitest suite is green. |
| `npm run test:e2e` | Failed | `service "backend" is not running` from Playwright global setup | FAIL | E2E is blocked by environment/service availability. |

### Backend Test Notes

- The `document_drafting` tests passed after the missing `import time` fix.
- The export/inspection-related tests still fail.
- `print-bundle` now reaches permission/eligibility handling rather than the earlier crash path, but the route still returns `403` in the tested setup.
- `inspection-view` still returns `500` in the tested setup.

