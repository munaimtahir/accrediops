# Playwright Failure Analysis

## Symptoms
Playwright E2E tests were consistently failing with two primary modes:
1.  **Timeout on Login:** `global-setup.cjs` and manual login steps were failing to find input fields like `#username-input`.
2.  **Broken Navigation:** Sidebar links were pointing to invalid URLs like `/projects/projects`, causing 500 errors in the backend when accessing the API with `project_id=NaN`.

## Root Cause Classification

| Cause | Classification | Notes |
|-------|----------------|-------|
| Element Visibility | Hydration/Timing | Next.js 15 with `Suspense` and `useSearchParams` defaults to client-side rendering for the login form. Playwright was not waiting long enough for hydration to complete. |
| URL Generation | Logic Bug | `useParams` in the main layout Sidebar component was capturing the static "projects" segment as `projectId` when at the root list level. |
| Strict Mode Violation | Selector Drift | Multiple "Open Worklist" buttons were present on the dashboard (one in the header actions and one in a card), causing strict mode failures. |
| Missing Seed Data | Environment | The `seed_e2e_state` command was not seeding `MasterValue` records, causing the admin masters list to be empty and the edit button to be missing. |
| Permission Mismatch | Environment | The `seed_e2e_state` command was not assigning `pw_owner` and `pw_reviewer` to project indicators, making the project dashboard and worklist invisible to them. |

## Application vs Environment
The failures were a **mix of application logic bugs (Sidebar URL generation) and environment/test setup issues (missing seed data and hydration timing).** Both have been addressed in this stabilization sprint.
