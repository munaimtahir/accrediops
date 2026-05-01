# Next Implementation Prompt

**Current Verified Status:** GO (Conditional). Build and test collection are restored. Smoke tests pass.

**Context:**
The hardening sprint is complete. The application is stable. We can now move back to building user-facing features.

**Top Priority Tasks:**
1. **Implement FMS Import UI**: Add a button and modal to the Frameworks Admin screen (`AdminFrameworksScreen`) to allow users to trigger the `POST /api/admin/frameworks/import/` endpoint with a CSV file.
2. **AI Action Center Polish**: Audit the AI Action Center components for any remaining stubbed data or UX gaps.
3. **Evidence Promotion E2E**: Add a new Playwright test for the full "Draft -> Review -> Promote to Evidence" workflow.

**Required Files:**
- `frontend/components/screens/admin-frameworks-screen.tsx`
- `backend/apps/api/views/frameworks.py`
- `frontend/tests/e2e/06_evidence_lifecycle.spec.ts`

**Acceptance Criteria:**
- User can successfully import an FMS framework from the UI.
- Document drafts can be promoted to evidence through the UI.
- E2E tests for these flows pass.
