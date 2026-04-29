# Admin Masters Edit UI

## Summary

A new feature has been added to the admin masters screen to allow editing of existing master list items.

## UI Changes

-   An "Edit" button has been added to each row in the `WorkbenchTable` on the admin masters screen.
-   Clicking the "Edit" button opens a modal window with a form to edit the selected item.
-   The edit form allows changing the `label` and `sort_order` of the master item.

## Implementation Details

-   The `AdminMastersScreen` component (`frontend/components/screens/admin-masters-screen.tsx`) has been updated to include the edit functionality.
-   A new component, `EditMasterForm`, has been created to encapsulate the edit form logic.
-   The `useSaveMasterValue` hook from `frontend/lib/hooks/use-admin.ts` is used to perform the `PATCH` request to update the master item.

## Testing

A Playwright test, `Admin masters edit` in `frontend/tests/e2e/17_recurring_and_masters_capability_fix.spec.ts`, has been added to verify the edit functionality. This test is currently failing due to environment issues.
