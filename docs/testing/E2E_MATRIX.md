# E2E Matrix

Canonical suite location: `frontend/tests/e2e/` (Playwright)

| Flow | Status | Test |
|---|---|---|
| project list opens | covered | `frontend/tests/e2e/app-flows.spec.ts` |
| project detail opens | partial | route coverage pending auth-seeded flow |
| worklist loads and filters work | partial | route smoke pending seeded auth flow |
| indicator detail opens | partial | pending seeded auth flow |
| add evidence flow works | missing | planned authenticated E2E |
| review evidence flow works | missing | planned authenticated E2E |
| mark indicator met valid flow | missing | planned authenticated E2E |
| recurring due/overdue flow | partial | backend/api covered; E2E pending auth-seeded flow |
| submit recurring instance works | missing | planned authenticated E2E |
| approve recurring instance works | missing | planned authenticated E2E |
| AI generate/accept non-mutation | partial | backend/api covered; E2E pending auth-seeded flow |
| clone project flow works | partial | backend/api covered; E2E pending auth-seeded flow |
| client profile + variable preview | partial | backend/api covered; E2E pending auth-seeded flow |
| print pack preview opens | partial | route smoke via app navigation pending auth seed |
| inspection mode opens with blockers | partial | page behavior in frontend tests; full auth E2E pending |
| export history/generate | partial | frontend unit + backend API covered; full auth E2E pending |
| admin pages load | covered (route) | `frontend/tests/e2e/app-flows.spec.ts` |
| audit filters work | partial | backend/api covered; E2E pending auth-seeded flow |
| import logs page loads | partial | frontend component/back API covered |
| unauthorized actions blocked in UI | partial | component behavior present; full E2E pending |

## Note
- Current Playwright suite validates live stack routing and core accessibility.
- Full authenticated transactional E2E requires stable seeded credentials/environment bootstrap, tracked as next hardening step.
- Suite uses `PLAYWRIGHT_BASE_URL` and writes artifacts to `OUT/playwright/` and `playwright-report/`.
- Browser binaries must be installed first (`npx playwright install`).
