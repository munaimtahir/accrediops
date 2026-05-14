# Remaining Gaps

This document details the outstanding issues and limitations identified during the sprint.

## 1. Backend API Persistence Issue (E2E Approval Flow)

*   **Gap:** The E2E tests for approving `ProjectEvidenceRequirement`s are still failing. The API returns `200 OK` but the response data shows the `status` as `MISSING`, indicating the backend update is not persisting correctly.
*   **Details:** Despite attempts to fix the backend service (`update_project_evidence_requirement`) and view logic (`ProjectEvidenceRequirementDetailView`), the status change is not being saved to the database. This is a critical blocking issue for end-to-end verification of the approval workflow. The exact cause (ORM, transaction, caching) requires further investigation.
*   **Impact:** High. Prevents full E2E verification of the evidence bridge approval flow.
*   **Recommendation:** Requires further debugging of the backend persistence layer, potentially involving examining Django ORM behavior, transaction handling, or caching mechanisms.

## 2. Recurring Workflow Failures

*   **Gap:** E2E tests related to recurring workflows (`08_recurring_workflows.spec.ts`, `17_recurring_and_masters_capability_fix.spec.ts`, `workflow-guidance.spec.ts`, `core-journeys.spec.ts`) continue to fail.
*   **Details:** Failures include `element(s) not found` or `received: undefined` errors, indicating pre-existing bugs in the recurring workflow feature itself.
*   **Impact:** Medium. These are functional regressions or pre-existing issues.
*   **Recommendation:** These tests should be investigated and fixed in a future sprint dedicated to recurring workflows.

## 3. AI Documentation Test Failure

*   **Gap:** The E2E test `40_framework_documentation_ai.spec.ts` fails, checking for advisory status on AI-generated drafts.
*   **Details:** The test expects `/Advisory:\s*true/i` to be visible, but it is not found. This could be an issue with AI draft generation, advisory status logic, or test assumptions.
*   **Impact:** Low. Likely an independent feature bug.
*   **Recommendation:** Investigate and fix the AI documentation feature or adjust test expectations.

## 4. Accessibility Test Failure

*   **Gap:** The test `19_accessibility.spec.ts` fails with `expect(locator).not.toBeVisible()`.
*   **Details:** An edit modal is visible when the test expects it to be closed, indicating a potential UI regression or timing issue in modal handling.
*   **Impact:** Low. Likely an independent UI/test issue.
*   **Recommendation:** Investigate and fix the modal state or test timing.

## 5. Final ZIP Export Status

*   **Gap:** The final ZIP export functionality is **not implemented**.
*   **Details:** Code review revealed no backend logic for creating ZIP archives. The `build_print_bundle` service generates data, and `export_eligibility_report` checks readiness, but the packaging step is missing.
*   **Impact:** Medium. This is a key feature that needs to be implemented.
*   **Recommendation:** A dedicated sprint/task is required to implement the final ZIP export engine.

## 6. CAPA Workflow Status

*   **Gap:** The CAPA workflow remains at a placeholder level.
*   **Details:** The `export_eligibility_report` and `build_print_bundle` acknowledge CAPA but use placeholder data (`pending_capa_count: 0`, empty `open_capa_report`). No CAPA models or logic were implemented.
*   **Impact:** Low (for this sprint). This was explicitly deferred.
*   **Recommendation:** A dedicated feature sprint is required to build out the CAPA functionality.
