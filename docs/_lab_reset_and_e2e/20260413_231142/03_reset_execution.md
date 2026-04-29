# 03 Reset execution

## Reset command path

- Implemented command: `backend/apps/projects/management/commands/reset_lab_state.py`
- Executed with LAB target count enforcement (`target-indicator-count=119` default).

## Cleanup actions performed

- Deleted non-LAB frameworks.
- Deleted projects and project indicators.
- Deleted evidence and recurring records.
- Deleted import/export logs and audit rows tied to stale state.
- Deleted stale client records.

## Safety constraints respected

- No runtime port changes (stayed on `18080`).
- No permission model broadening.
- Required auth/admin infrastructure preserved.
