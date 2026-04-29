# Stabilization Plan

## Phase 1: Diagnose Playwright Failures
- Run the full Docker Compose stack locally and monitor readiness.
- Execute Playwright tests manually to replicate the failure.
- Check backend logs and frontend logs to verify health status.

## Phase 2: Stabilize Test Environment
- Fix the `baseURL` or setup process.
- Create a script or sequence to ensure `accrediops-caddy` and its dependencies are fully "healthy" before tests begin.
- Verify test data constraints in existing `tests/e2e/global-setup.cjs`.

## Phase 3 & 4: Implement Approve Action & Capability UI Alignment
- In `frontend/components/screens/project-recurring-screen.tsx`:
  - Add an "Approve" button alongside the "Submit" action.
  - Disable it strictly based on `row.capabilities?.can_approve`.
  - Check the backend `POST /api/recurring/instances/<pk>/approve/` endpoint requirements and hook it up if missing from frontend API client, or ensure it's used correctly.
  - Document truth alignment.

## Phase 5: UI Label Consistency Review
- Inspect and adjust text for uniformity across views (e.g., standardizing "Dashboard", "Worklist", "Approve").

## Phase 6 & 7: Backend and Frontend Verification
- Run `python manage.py test`.
- Verify the frontend build.

## Phase 8 & 9: Playwright E2E and Risk Review
- Run Playwright E2E tests fully against the fixed environment and features.
- Evaluate remaining risks in transitions and setup.

## Phase 10: Final Evidence Pack
- Summarize changes and current status.