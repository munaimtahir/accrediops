# Recurring Workflow Failure Analysis

## Context

During the previous sprint ("Gap and CAPA MVP + Evidence Workflow Stabilization Sprint"), several E2E tests related to recurring workflows were identified as failing. These were explicitly deemed out of scope for that sprint but are a secondary objective for the current sprint.

## Baseline Failures (from Stage 2)

The following E2E tests related to recurring workflows failed during the baseline verification of this sprint:

| Test | Failure | Initial Diagnosis | Status |
|---|---|---|---|
| `08_recurring_workflows.spec.ts` | Locator issues (`toBeVisible()`, `toBeTruthy()`, `toBeDisabled()`), elements not found, or received undefined values. | Likely stale selectors, timing issues, or backend logic not correctly setting up recurring instances. | FAILED |
| `17_recurring_and_masters_capability_fix.spec.ts` | Similar locator and element visibility issues related to recurring queue row actions. | Potential selector mismatch or unexpected UI state. | FAILED |
| `workflow-guidance.spec.ts` | `expect(locator).toBeVisible() failed` for action buttons. | May be a downstream effect of recurring workflow not being correctly setup or rendered. | FAILED |
| `core-journeys.spec.ts` | Multiple failures related to page navigation, URL matching, and element visibility. | Broad failures, likely due to fundamental issues in how recurring workflow data is seeded or presented. | FAILED |

## Initial Analysis

The failures consistently point to issues with:
1.  **UI Element Visibility/Existence:** Tests are unable to find or interact with expected buttons or text elements in the recurring queue or related screens.
2.  **Data Inconsistency:** Tests sometimes receive `undefined` values when expecting a populated recurring instance, suggesting seeding issues or incorrect data fetching.
3.  **Timing/State:** Playwright often reports `Timeout` errors, indicating either the application state is not updating as expected or the UI is taking too long to reflect changes.

These issues are symptomatic of either:
*   **Outdated/Brittle E2E selectors:** The Playwright tests might be using selectors that no longer match the UI.
*   **Insufficient/Incorrect Seed Data:** The `seed_e2e_state` command might not be creating sufficient or correct recurring workflow data.
*   **Backend Logic Issues:** The backend services for managing recurring instances might have bugs that lead to incorrect UI states.
*   **Frontend State Management:** Frontend components might not be refreshing correctly after backend updates.

## Proposed Strategy for Stabilization

Given the secondary priority of this objective, the strategy is to:
1.  **Review `seed_e2e_state` and recurring services:** Ensure the seeding logic for recurring items is correct and creates a valid set of data for the tests.
2.  **Inspect recurring workflow E2E tests:** Update selectors, add explicit waits, and review test assumptions against the current UI/backend.
3.  **Targeted Fixes:** Apply minimal, safe fixes to address the most apparent issues.
4.  **Documentation:** Clearly classify any remaining failures and defer to a dedicated sprint if extensive work is required.
