# 02_CLASSIFICATION_E2E_FIXES.md

## Problem Diagnosis
The indicator classification E2E test (`20_indicator_classification_workflow.spec.ts`) was failing due to:
1. **Strict Mode Violation:** `getByText('AI Suggested')` resolved to multiple elements (an option in a dropdown and a badge in the table).
2. **Stale Build:** The frontend test server needed a rebuild/restart to pick up the recently added classification route components.

## Fixes Applied
1. **Specific Locators:** Updated `getByText` calls to be scoped within `getByRole('table')` or other containers to avoid ambiguity.
2. **Environment Synchronization:** Rebuilt and restarted the frontend Docker container to ensure the latest code and routes are active.
3. **Mocks Alignment:** Ensured that API mocks in the test correctly simulate the backend behavior for bulk actions and individual row updates.

## Verified Workflow
- **Initial Load:** Framework selection and indicator list rendering.
- **AI Classification:** Triggering "Run AI Classification" and verifying the UI updates with "AI Suggested" badges.
- **Manual Overrides:** Changing evidence type via dropdown and verifying "Manually Changed" status.
- **Bulk Approval:** Selecting rows and using "Bulk Approve Selected" to move indicators to "Human Reviewed" status.
- **Filtering:** Verifying that status filters correctly show/hide rows based on the current classification state.
