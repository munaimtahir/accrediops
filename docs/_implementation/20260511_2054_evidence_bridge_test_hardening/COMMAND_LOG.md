# Command Log

## Environment and baseline

- `pwd`
- `git status --short`
- `date +%Y%m%d_%H%M`
- `docker compose ps`

## Backend verification

- `.venv/bin/python -m py_compile apps/ai_actions/services/document_drafting.py`
- `.venv/bin/python manage.py check`
- `.venv/bin/python manage.py makemigrations --check --dry-run`
- `.venv/bin/python manage.py migrate`
- `.venv/bin/python -m pytest apps/api/tests/test_print_pack.py apps/api/tests/test_evidence_pack.py apps/api/tests/test_admin_readiness_inspection_exports.py apps/api/tests/test_indicator_classification.py -q`

## Frontend verification

- `cd frontend && npm run lint`
- `cd frontend && npm run typecheck`
- `cd frontend && npm run build`
- `cd frontend && npm test`

## E2E verification

- `cd frontend && npx playwright test`

