# 21 — Feature Test Matrix

| Layer | Scope | Result | Evidence |
|---|---|---|---|
| Backend tests | API/governance/workflow services | PASS (31/31) | `backend_test_output.txt` |
| Frontend unit tests | Workbench screens/components | PASS (36/36) | `frontend_test_output.txt` |
| Frontend build | Production Next build | PASS | `frontend_build_output.txt` |
| Playwright E2E | Core operational + governance journeys | PASS (26/26) | `playwright_release_output.txt` |
| Live auth smoke | PHC login/session/logout flow | PASS | `production_smoke_output.txt`, `live_auth_smoke.txt` |
| DB integrity | FK + core table sanity | PASS | `db_integrity_checks.txt`, `db_row_counts_after.txt` |
