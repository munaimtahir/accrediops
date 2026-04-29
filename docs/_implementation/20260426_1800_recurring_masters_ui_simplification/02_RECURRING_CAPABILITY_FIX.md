# Recurring Capability Fix

## Summary

The recurring queue API endpoint (`/api/recurring/queue/`) has been updated to include a `capabilities` object in each row of the response. This object contains boolean flags that indicate whether the current user can perform certain actions on the recurring instance.

## API Payload Change

The `RecurringEvidenceInstanceSerializer` now includes a `capabilities` field, which is a `SerializerMethodField`.

**Example `capabilities` object:**

```json
{
  "can_submit": true,
  "can_approve": false
}
```

## Implementation Details

-   The `get_capabilities` method in the serializer uses the `can_project_owner_access` and `can_project_reviewer_access` permission functions from `apps.workflow.permissions` to determine the values of the flags.
-   The request object is passed to the serializer context from the `RecurringQueueView`.
-   The frontend `RecurringInstance` type in `frontend/types/index.ts` has been updated to include the optional `capabilities` field.
-   The `project-recurring-screen.tsx` component now uses these flags to conditionally disable the "Submit" button.

## Testing

A backend unit test, `test_recurring_queue_capabilities`, has been added to `backend/apps/api/tests/test_recurring_queue.py` to verify the correctness of the `capabilities` flags for different user roles. This test is passing.

A Playwright test, `Recurring queue row action visibility` in `frontend/tests/e2e/17_recurring_and_masters_capability_fix.spec.ts`, has been added to verify the UI behavior. This test is currently failing due to environment issues.
