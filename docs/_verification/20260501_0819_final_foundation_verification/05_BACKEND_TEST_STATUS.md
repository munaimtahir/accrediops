# Backend Test Status

Record canonical backend command runner, check/migrations verification, and pytest status with evidence.

## Environment and Runner

- Runner used: `python3` (note: `python` was not available in this environment).
- Backend root: `backend/`
- Test runner: `pytest` (pytest-django configured via `backend/pytest.ini`).

## Commands Executed

Executed on 2026-05-01 (UTC):

- `cd backend && python3 manage.py check`
- `cd backend && python3 manage.py makemigrations --check --dry-run`
- `cd backend && pytest --collect-only`
- `cd backend && pytest`

## Results

- `python3 manage.py check`: PASS (`System check identified no issues (0 silenced).`)
- `python3 manage.py makemigrations --check --dry-run`: PASS (`No changes detected`)
- `pytest --collect-only`: PASS after fixes (124 tests collected).
- `pytest`: PASS (`124 passed`).

Artifacts produced:

- Coverage HTML: `OUT/backend_htmlcov/` (written by pytest-cov)
- Coverage XML: `OUT/backend_coverage.xml`

Notes / blockers encountered and resolved during verification:

- `apps/indicators/tests/test_services.py` initially had syntax errors and broken content (collection failure) → fixed to restore collection and align with workflow transitions/permissions so verification could proceed.
- `backend/pytest.ini` initially wrote HTML coverage to `backend/htmlcov/` which triggered a `PermissionError` in this environment → redirected coverage outputs to `OUT/` so tests can complete.

## Status Classification

- Backend checks: VERIFIED BY TEST
- Backend migrations check: VERIFIED BY TEST
- Backend tests: VERIFIED BY TEST

