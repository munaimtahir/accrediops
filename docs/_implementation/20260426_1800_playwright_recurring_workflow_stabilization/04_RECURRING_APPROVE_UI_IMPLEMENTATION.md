# Recurring Approve UI Implementation

## Summary
The missing approval workflow for the recurring queue has been fully implemented in the frontend. This completes the action loop for recurring evidence instances.

## Key Components

### 1. Approve Action
- Added an "Approve" button to the recurring queue rows in `frontend/components/screens/project-recurring-screen.tsx`.
- The button is strictly gated by the `can_approve` capability provided by the backend.
- It is enabled only for assigned reviewers/approvers or admins.

### 2. Approval Modal
- Implemented a decision modal that allows the reviewer to:
    - Select a decision: **Approve** or **Reject / Return**.
    - Enter mandatory approval notes to record the context of the decision.
- The modal uses the `useApproveRecurring` hook for state management and submission.

### 3. API Integration
- The frontend now calls `POST /api/recurring/instances/<pk>/approve/` with the decision and notes.
- On success, the local queue state is automatically refreshed by invalidating the React Query keys.

## User Experience
Users with the appropriate permissions now see a clear action path for finalizing recurring tasks, while non-authorized users see a disabled button with an explanatory tooltip.
