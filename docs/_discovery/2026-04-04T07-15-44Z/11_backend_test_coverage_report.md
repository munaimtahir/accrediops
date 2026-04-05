# Backend Test Coverage Report

## Commands and artifacts
- Test run: `python3 backend/manage.py test apps.api.tests --verbosity 1`
- Coverage run: `backend/.venv/bin/pytest`
- Output files:
  - `OUT/discovery/2026-04-04T07-15-44Z/backend_test_output.txt`
  - `OUT/discovery/2026-04-04T07-15-44Z/backend_coverage_output.txt`

## Result summary
- Backend API tests: **25 passed**
- Coverage total: **83%**
- Before/after: **81% → 83%** (see `coverage_before_after.txt`)

## Newly covered in this pass
1. Recurring instance submit + approve status transition path (`test_recurring_submit_and_approve_flow_updates_instance_status`).

## Already covered (not exhaustive)
- Clone project without evidence leakage.
- Print pack structured output.
- AI generation and non-mutation safety.
- Mark-met readiness enforcement.
- Recurring queue generation and due/overdue filtering.
- Physical evidence fields.

## Still uncovered / weaker areas
- `apps/api/views/exports.py` lower branch coverage.
- parts of `apps/api/views/users.py`, `apps/api/views/admin.py`, and workflow permission branches.
- model `__str__` and minor branch paths in several modules.
