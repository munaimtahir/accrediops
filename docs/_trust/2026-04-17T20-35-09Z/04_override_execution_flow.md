# 04 Override Execution Flow

## Screen Split

The admin overrides surface is now split into two distinct zones:

1. `Override Control`
   action-only execution path.
2. `Override audit history`
   read-only history table.

## Execution Steps

1. Select a completed indicator.
2. Select override type.
3. Enter a reason.
4. Open confirmation modal.
5. Confirm governed state change.

## Safety Controls

- Only `MET` indicators are offered for reopen override.
- Reason is mandatory before confirmation can open.
- Confirmation modal states:
  `This action will change governed state. Continue?`
- Mutation uses the existing admin-only reopen endpoint, not a frontend-only shortcut.
- Successful execution refreshes both candidate indicators and override history.

## Audit Outcome

- Reopen action still writes workflow status history.
- Reopen action still writes audit events with actor, timestamp, and reason.
- History table remains non-mutating by design.
