# E2E Environment Repair Plan

## Context

The E2E test environment was previously blocked by multiple issues that have now been addressed:
1.  **ImportError:** `ProjectEvidenceRequirementDetailView` was not importable from `apps.api.views.project_evidence_requirements`. This was fixed by restoring the correct class definition and ensuring proper import paths.
2.  **Seeding Failure:** `seed_e2e_state.py` failed due to the missing "PHC LAB" framework. This was resolved by creating a new, idempotent management command (`seed_phc_lab_framework.py`) and integrating it into `seed_e2e_state.py`.
3.  **Backend API Approval Bug:** E2E tests for approving `ProjectEvidenceRequirement`s failed with a 500 error or stale data, indicating a persistence issue. This was fixed by correcting the `ProjectEvidenceRequirementDetailView` definition, ensuring proper reliance on DRF's `serializer.save()`, and modifying the `update_project_evidence_requirement` service to explicitly set fields and use `@transaction.atomic`.
4.  **Pre-existing Failures:** Tests related to recurring workflows and AI documentation were identified as out-of-scope for this sprint's fixes and remain outstanding.

## Repair Strategy

The sprint's strategy focused on creating a self-contained E2E environment and fixing the evidence bridge approval flow.

1.  **Deterministic E2E Seeding:**
    *   **Action:** Developed and implemented `seed_phc_lab_framework.py` management command.
    *   **Integration:** Modified `seed_e2e_state.py` to call the new framework seeding command.
    *   **Validation:** Verified that `docker compose exec ... seed_e2e_state` now runs successfully, confirming the "PHC LAB" framework is present.

2.  **Backend API and View Fixes:**
    *   **Issue:** `ImportError` in `global-setup.cjs` and backend API failures preventing requirement approval.
    *   **Fix:**
        *   Restored the correct class definition for `ProjectEvidenceRequirementDetailView` in `backend/apps/api/views/project_evidence_requirements.py`.
        *   Refined the view to correctly handle PATCH requests and permissions.
        *   Ensured the `update_project_evidence_requirement` service correctly handles field updates and is executed within an atomic transaction.
    *   **Validation:** Backend tests related to this flow are now passing.

3.  **Playwright E2E Test Fixes:**
    *   **Issue:** Tests (`30_phc_lab_framework_full_workflow.spec.ts`, `operator-first-time.spec.ts`) were failing due to the backend API not correctly persisting the `APPROVED` status.
    *   **Fix:** Addressed the backend persistence issue by correcting the view's interaction with the service and ensuring atomic transactions.
    *   **Outcome:** The evidence bridge approval flow tests in `30_phc_lab_framework_full_workflow.spec.ts` and `operator-first-time.spec.ts` are now passing.

## Remaining Known Issues (Out of Scope)

*   **Recurring Workflows:** Tests related to recurring workflows (`08_recurring_workflows.spec.ts`, `17_recurring_and_masters_capability_fix.spec.ts`, `workflow-guidance.spec.ts`, `core-journeys.spec.ts`) continue to fail, appearing to be pre-existing issues.
*   **AI Documentation:** The test `40_framework_documentation_ai.spec.ts` fails, possibly due to AI feature state or test assumptions.
*   **Accessibility Tests:** `19_accessibility.spec.ts` fails with `expect(locator).not.toBeVisible()`, indicating an unexpected modal state.

## Expected Outcome

With the deterministic seeding and backend fixes, the E2E environment is now stable for the evidence bridge approval flow, and the relevant tests are passing. The identified remaining failures are either out of scope or pre-existing issues.
