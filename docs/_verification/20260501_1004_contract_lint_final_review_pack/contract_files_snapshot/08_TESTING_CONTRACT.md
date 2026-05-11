# Testing Contract

Minimum gate expectations (local + CI where applicable):

Backend:
- `cd backend && python3 manage.py check`
- `cd backend && python3 manage.py makemigrations --check --dry-run`
- `cd backend && pytest`

Frontend:
- `cd frontend && npm run build`
- `cd frontend && npm run test`
- `cd frontend && npm run lint` (must be non-interactive and fail on lint errors)

E2E (requires runtime up, typically Docker):
- `cd frontend && npx playwright test tests/e2e/15_smoke_clean_new_app_mode.spec.ts`
- `cd frontend && npx playwright test tests/e2e/20_indicator_classification_workflow.spec.ts`

Contract documentation:
- Any sprint that changes backend routes or frontend screens must update:
  - `01_API_ROUTE_CONTRACT.md`
  - `02_FRONTEND_SCREEN_CONTRACT.md`
  - `03_FRONTEND_ACTION_TO_BACKEND_MAP.md`
  - `04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md`
