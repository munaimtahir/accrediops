# Remaining Gaps

This document details the outstanding issues and limitations identified during the "Final ZIP Export Engine & Recurring Workflow Stabilization Sprint".

## 1. Final ZIP Export Engine Crash (Blocking)

*   **Gap:** The `build_final_zip_export` service consistently results in a `500 Internal Server Error` when invoked via the API.
*   **Details:** Despite extensive debugging of test setup (user creation, project initialization, evidence creation, CAPA setup) and backend code (service logic, API view implementation, template rendering), the `build_final_zip_export` service crashes. The exact root cause of the crash could not be identified or resolved within the sprint's scope or tool capabilities, leading to an unhandled exception. This directly blocks verification of the final ZIP export functionality.
*   **Impact:** High. The primary objective of the sprint (implementing and verifying the final ZIP export) could not be fully achieved.
*   **Recommendation:** Requires dedicated backend debugging, potentially with more granular logging or an interactive debugger, to identify the exact line of failure within `build_final_zip_export`.

## 2. Recurring Workflow Failures (Unaddressed)

*   **Gap:** Pre-existing E2E tests related to recurring workflows (`08_recurring_workflows.spec.ts`, `17_recurring_and_masters_capability_fix.spec.ts`, `workflow-guidance.spec.ts`, `core-journeys.spec.ts`) remain failing.
*   **Details:** These failures were baselined and analyzed (see `04_RECURRING_WORKFLOW_FAILURE_ANALYSIS.md`) but no fixes were applied due to the priority on the final ZIP export and the subsequent debugging loop.
*   **Impact:** Medium. Blocks verification of recurring workflow functionality.
*   **Recommendation:** Needs a dedicated sprint to investigate, diagnose, and fix the underlying issues in the recurring workflow backend logic and frontend UI.

## 3. Frontend CAPA Creation Modals

*   **Gap:** The frontend UI to create new Gaps and CAPAs from the indicator detail screen is not implemented.
*   **Details:** While the backend APIs and services for CAPA creation are in place, the frontend MVP focused on displaying existing CAPA data (badges, summaries, reports). The actual interactive elements (buttons, forms/modals) for creating Gaps and CAPAs were out of scope for the frontend MVP of the previous sprint and were not addressed in this sprint.
*   **Impact:** Medium. Limits user interaction with the new CAPA functionality.
*   **Recommendation:** Implement frontend modals and forms for creating Gaps and CAPAs.

## 4. Advanced CAPA Analytics

*   **Gap:** Advanced analytics features for CAPA (e.g., trend analysis, root cause categorization across projects) are not implemented.
*   **Details:** The current CAPA implementation focuses on core lifecycle and reporting.
*   **Impact:** Low. Planned future work.
*   **Recommendation:** Implement in a future sprint dedicated to CAPA enhancements.

## 5. AI Documentation Test Failure

*   **Gap:** The E2E test `40_framework_documentation_ai.spec.ts` fails.
*   **Details:** Fails due to `expect(locator).toBeVisible() failed` for advisory status. This was not addressed.
*   **Impact:** Low. Independent feature bug.
*   **Recommendation:** Investigate and fix the AI documentation feature or adjust test expectations.

## 6. Accessibility Test Failure

*   **Gap:** The E2E test `19_accessibility.spec.ts` fails.
*   **Details:** Fails with `expect(locator).not.toBeVisible()` on an edit modal, indicating an unexpected modal state. This was not addressed.
*   **Impact:** Low. Independent UI/test issue.
*   **Recommendation:** Investigate and fix the modal state or test timing.

## 7. Production Readiness

*   **Gap:** Full performance benchmarking, security hardening of new API endpoints, and production-specific caddy/deployment configuration updates were out of scope.
*   **Impact:** Medium. Standard for production deployment.
*   **Recommendation:** Implement as part of pre-production deployment activities.
