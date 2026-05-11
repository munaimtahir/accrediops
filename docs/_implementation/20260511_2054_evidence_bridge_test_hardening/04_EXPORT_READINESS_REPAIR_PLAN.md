# Export Readiness Repair

## Problem

The export layer had placeholder readiness behavior and could not reliably drive print-bundle / inspection logic from actual project evidence state.

## Fix applied

- `backend/apps/evidence/services.py`
  - `calculate_project_evidence_readiness(project)` now returns real requirement-level counts:
    - total / approved / missing / partial / submitted / rejected / not_applicable
    - mandatory counts and blockers
    - readiness percent
    - export-ready boolean
- `backend/apps/exports/services.py`
  - removed mock readiness sources
  - export eligibility now uses real readiness from:
    - `project_readiness(project)`
    - `calculate_project_evidence_readiness(project)`
  - print-bundle no longer crashes on invalid prefetch assumptions
  - print-bundle now carries deterministic readiness and blocker metadata

## Verification

- `apps/api/tests/test_print_pack.py` -> pass
- `apps/api/tests/test_admin_readiness_inspection_exports.py` -> pass
- `apps/api/tests/test_evidence_pack.py` -> pass after aligning the test to the live response contract

