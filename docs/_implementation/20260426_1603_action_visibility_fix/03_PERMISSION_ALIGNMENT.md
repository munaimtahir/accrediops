# Permission Alignment

## Backend

- Added server-side capability booleans to the indicator detail payload:
  - `can_assign`
  - `can_update_working_state`
  - `can_start`
  - `can_send_for_review`
  - `can_mark_met`
  - `can_reopen`
  - `can_add_evidence`
  - `can_edit_evidence`
  - `can_review_evidence`
  - `can_submit_recurring`
  - `can_approve_recurring`
  - `can_generate_ai`
  - `can_accept_ai`

- These flags are derived from the same backend permission logic used by mutating endpoints.
- Existing backend enforcement was not weakened.

## Frontend

- `IndicatorDrawer` now uses backend capabilities instead of broad role-only checks.
- `IndicatorDetailScreen` now uses backend capabilities instead of broad role-only checks.
- Action enablement is now assignment-aware for:
  - working state updates
  - start
  - send for review
  - mark met
  - evidence add/edit
  - evidence review
  - recurring submit/approve
  - AI generate/accept

## Verified behavior

- Unassigned owner capability booleans are false at the API layer.
- Assigned owner, reviewer, and approver receive the expected allowed capabilities.
- `LEAD` retains broad governed access except `reopen`, which remains admin-only.
- `ADMIN` retains full governed access including reopen.
