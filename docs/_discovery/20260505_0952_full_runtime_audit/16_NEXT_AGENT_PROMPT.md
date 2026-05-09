# Next Agent Prompt

You are tasked with continuing the development of AccrediOps, an accreditation operations platform. The codebase has recently been stabilized and verified.

## Current State
- **Backend:** Django 5.2. All 124 tests pass. AI calls are mocked.
- **Frontend:** Next.js 15. Lint and typecheck are clean.
- **Infrastructure:** Docker Compose optimized for development (`npm run dev`).

## New Feature Directive: Real-time Notifications
The app currently lacks a notification system to alert users of assignments, review requests, and approvals.

1. **Research:** Identify the best point in the `workflow` and `indicators` service layers to trigger notifications.
2. **Strategy:** Implement a database-backed notification model. AI should NOT be used for this core logic.
3. **Execution:**
   - Create a `notifications` app in the backend.
   - Implement an API endpoint to fetch and mark notifications as read.
   - Add a notification bell/panel in the frontend sidebar or header.
4. **Validation:** Add unit tests for the notification triggers and a Playwright test for the UI interaction.

Refer to `docs/_discovery/20260505_0952_full_runtime_audit/` for the latest verified state.
