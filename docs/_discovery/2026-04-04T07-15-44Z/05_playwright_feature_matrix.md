# Playwright Feature Matrix

## Evidence sources
- Spec: `frontend/tests/e2e/app-flows.spec.ts`
- Output: `OUT/discovery/2026-04-04T07-15-44Z/playwright_full_output.txt`
- Artifacts index: `OUT/discovery/2026-04-04T07-15-44Z/playwright_artifact_index.txt`

| Feature | Spec | Preconditions | Result | Classification | Notes |
|---|---|---|---|---|---|
| Project list opens | app-flows #1 | Running app + auth behavior stable | **Failed** | broken wiring / auth gate expectation mismatch | Redirected to `/login`. |
| Login page opens | app-flows #2 | Login route serves expected UI | **Failed** | selector/runtime mismatch | Expected `AccrediOps sign-in` text not found in run. |
| Admin route resolves | app-flows #3 | Protected route behavior known | **Failed** | auth/setup issue | Redirected to `/login`. |
| Health endpoints via proxy | app-flows #4 | backend/frontend health proxied | **Passed** | reachable + API-backed | |
| Project detail discoverability | app-flows #5 | route exists | **Passed** | reachable | URL matched project or login route. |
| Indicator detail discoverability | app-flows #6 | route exists | **Passed** | reachable | |
| Recurring route discoverability | app-flows #7 | route exists | **Passed** | reachable | |
| Print pack route discoverability | app-flows #8 | route exists | **Passed** | reachable | |
| Client profile route discoverability | app-flows #9 | route exists | **Passed** | reachable | |

## Summary
- **6 passed / 3 failed**.
- Failures are concentrated in auth/login route expectation behavior, not route absence.
