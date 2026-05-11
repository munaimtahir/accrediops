# Reset Lab State Verification

Verify `reset_lab_state.py` safety and behavior, including flags, confirmation gating, and preservation of framework definitions.

## Code Review Findings

File reviewed: `backend/apps/projects/management/commands/reset_lab_state.py`

Claims checked and evidence:

- `--dry-run`: PRESENT (prints counts and rolls back via `transaction.set_rollback(True)`).
- `--confirm`: PRESENT (required for destructive execution).
- `--reset-classifications`: PRESENT (updates framework `Indicator` classification fields).
- Protection against destructive reset without confirmation: PRESENT (`CommandError` unless `--dry-run` or `--confirm`).
- Mutual exclusion of `--dry-run` and `--confirm`: PRESENT (explicit `CommandError`).
- Preservation of framework definitions: MOSTLY (prints preserved `Framework/Area/Standard/Indicator` counts; does not delete these models; does purge `ImportLog` and `AuditEvent`, which may be considered non-operational evidence of framework import history).
- Deletion scope appears limited to operational/runtime records: MOSTLY (purges projects, project indicators, comments/history, evidence, exports, recurring, AI generated outputs, audit events, client profiles, import logs).
- Safe rollback behavior during dry run: PRESENT (atomic transaction + rollback).
- Clear stdout messages: PRESENT (mode header, per-model counts, preserved counts, completion message).

## Commands Executed

Executed against local repo DB (`backend/db.sqlite3`) on 2026-05-01:

Non-destructive verification:

- `cd backend && python3 manage.py reset_lab_state --dry-run`
- `cd backend && python3 manage.py reset_lab_state --dry-run --reset-classifications`
- `cd backend && python3 manage.py reset_lab_state` (expected safe refusal)

Destructive verification (local SQLite only):

- `cd backend && python3 manage.py reset_lab_state --confirm`
- `cd backend && python3 manage.py reset_lab_state --dry-run` (post-confirm sanity check)

Observed outcomes:

- Without `--confirm` or `--dry-run`, command refuses with: `CommandError: You must provide either --dry-run or --confirm.`
- `--dry-run` reports deletion counts and preserves framework counts; no mutation occurs.
- `--confirm` deletes operational data; follow-up `--dry-run` shows operational counts are `0` while framework counts remain.

## Test Evidence

- `backend/apps/projects/tests/test_reset_lab_state.py`: MISSING (dedicated command test not found at expected path).

## Status Classification

- Reset command safety: VERIFIED BY CODE + VERIFIED BY RUNTIME
- Reset command tests: MISSING

