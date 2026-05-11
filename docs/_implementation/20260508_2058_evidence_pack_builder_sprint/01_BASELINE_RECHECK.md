# PHASE 1 — BASELINE RECHECK

This document contains the results of the baseline recheck performed at the start of the sprint.

| Area                  | Result                               | Details                                                                                                   |
| --------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Backend check         | PASS                                 | `System check identified no issues (0 silenced).`                                                         |
| Migration check       | PASS                                 | `No changes detected`                                                                                     |
| Backend tests         | PASS                                 | 137 passed                                                                                                |
| Backend coverage      | 82%                                  | -                                                                                                         |
| Frontend lint         | PASS (with warning)                  | `1 problem (0 errors, 1 warning)` in `tests/e2e/helpers.ts`                                               |
| Frontend typecheck    | PASS                                 | -                                                                                                         |
| Frontend unit tests   | PASS                                 | 53 passed                                                                                                 |
| Frontend build        | PASS                                 | -                                                                                                         |
| Docker health         | PASS                                 | All containers (`backend`, `frontend`, `caddy`) started and are healthy.                                  |
| Playwright full run   | 76/80 Passed (2 Failed, 2 Flaky)     | Failures match the known issues: `admin override`, `workflow guidance`. Flakiness in `non-admin reopen` and `export lifecycle`. |
