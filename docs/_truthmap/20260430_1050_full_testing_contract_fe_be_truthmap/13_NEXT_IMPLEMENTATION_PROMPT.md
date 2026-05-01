# Next Implementation Prompt

**Current Verified Status:** NO-GO. Test suites and production builds are failing due to syntax and type errors. E2E tests are blocked.

**Top Priority Fixes:**
1. Restore backend test suite.
2. Restore frontend production build.
3. Fix AI classification live API filter bug.

**Files to Inspect:**
- `backend/apps/indicators/tests/test_services.py` (Line 116 syntax error)
- `frontend/components/screens/admin-document-generation-queue-screen.tsx` (TypeScript `Record<string, unknown>[]` to `DocumentDraft[]` assignment error)
- `frontend/components/screens/admin-frameworks-screen.tsx` (AI filter logic)

**Exact Tasks:**
1. Fix the `SyntaxError: invalid syntax` around `test_assign_project_indicator_success` in `test_services.py`. Ensure all backend tests pass.
2. Fix the type error in `admin-document-generation-queue-screen.tsx` so that `npm run build` completes successfully.
3. Refactor the `admin-frameworks-screen.tsx` AI assistance filter to query against the `ai_assistance_level` DB field rather than making a live API call to the AI provider.
4. Run `npx playwright test tests/e2e/smoke.spec.ts` to verify E2E unblocking.

**Required Tests:**
- `pytest` must pass.
- `npm run build` and `npm run test:coverage` must pass.
- E2E smoke tests must run without startup errors.

**Required Documentation Updates:**
- Update `TESTING.md` if any test commands change.
- Update Contract Documentation if the AI filter fix modifies an API route payload.

**Acceptance Criteria:**
- Docker stack starts without frontend crashing.
- No syntax or type errors remain in the main branches.

**Non-goals:**
- Do not build the FMS import feature yet.
- Do not rewrite the AI integration completely; only fix the filtering bug.