# 08 — Cleanup Plan

## Plan
1. Snapshot DB backup.
2. Enumerate candidates by model family and naming/pattern rules.
3. Delete dependent operational records in safe FK order.
4. Remove seeded/non-production users not required for runtime.
5. Re-run row counts and FK integrity checks.
6. Re-run after test/e2e execution to remove reseeded rows.

## Safety controls
- Backup captured before destructive operations.
- Multi-pass cleanup to catch test reseeding drift.
- Final integrity validation (`fk_violations=0`).
