# 20 — Release Test Plan

## Layers executed
1. Backend automated tests.
2. Frontend unit tests.
3. Frontend production build.
4. Playwright E2E suite.
5. Live production-smoke on PHC domain with auth + workflow API path checks.

## Acceptance focus
- Auth/session continuity.
- Protected route access behavior.
- Project/worklist/recurring/export/print endpoints.
- Build/runtime readiness.
- Post-cleanup data sanity.
