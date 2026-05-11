# Commands and Results

This file captures every command executed for this sprint and its outcome.

## Backend (seed / sanity)
- `docker compose ps`
- `docker compose exec -T backend python manage.py seed_master_values`
- `docker compose exec -T backend python manage.py seed_policies`
- `docker compose exec -T backend python manage.py seed_e2e_state --password x --clean-e2e-records --ensure-client --ensure-project --initialize-project`

## Playwright
- `cd frontend && npx playwright test tests/e2e/30_phc_lab_framework_full_workflow.spec.ts`

## Frontend gates
- `cd frontend && npm run lint`
- `cd frontend && npm run build`

## Backend tests (only if backend changes required)
- `cd backend && python3 manage.py check`
- `cd backend && pytest`
