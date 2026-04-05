# E2E Test Coverage Report

## Commands and artifacts
- Run: `npx playwright test tests/e2e/app-flows.spec.ts`
- Outputs:
  - `OUT/discovery/2026-04-04T07-15-44Z/playwright_full_output.txt`
  - `OUT/discovery/2026-04-04T07-15-44Z/playwright_discovery_output.txt`
  - `OUT/discovery/2026-04-04T07-15-44Z/playwright_artifact_index.txt`

## Result summary
- Before/after: **4 pass / 0 fail → 6 pass / 3 fail**
- Expanded route discoverability coverage for project detail, indicator detail, recurring, print-pack, client-profile routes.

## Failure classification
1. **Project list opens**: auth/setup expectation mismatch (redirect to `/login`).
2. **Login page opens**: selector/runtime mismatch (`AccrediOps sign-in` not found during run).
3. **Admin route resolves**: auth/setup expectation mismatch (redirect to `/login`).

## Coverage shape
- Strong: route discoverability checks.
- Weak: full user-intent workflows (login success, create project, evidence review lifecycle, recurring approval lifecycle in browser context).
