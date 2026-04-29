# 02 Selected Port Decision

- `ACCREDIOPS_CANONICAL_DEV_PORT=18080`

## Decision rationale
- Host `8080` is occupied by another app (`fmu_frontend`) on this shared server.
- `18080` was verified free in both allocation truth and active-binding checks before assignment.
- It keeps AccrediOps on a dedicated high port while preserving same-origin proxy behavior.

## Canonical browser origins
- `http://localhost:18080/`
- `http://127.0.0.1:18080/`
