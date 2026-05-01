# AccrediOps Testing Documentation

This document provides verified instructions for running tests and maintaining the AccrediOps platform.

## 1. Prerequisites
- Docker & Docker Compose
- Node.js v20+
- Python 3.12+

## 2. Backend Testing (Pytest)
The backend uses `pytest` with `pytest-django`.

**Commands:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Run all tests
pytest
# Collect only (to verify syntax/imports)
pytest --collect-only
```

## 3. Frontend Testing (Vitest & Next.js Build)
The frontend uses `vitest` for unit/integration tests and `next build` for type checking.

**Commands:**
```bash
cd frontend
npm install
# Run unit tests with coverage
npm run test:coverage
# Verify types and production build
npm run build
```

## 4. E2E Testing (Playwright)
Playwright is used for end-to-end flows. The application must be running (either via Docker or locally).

**Setup:**
```bash
cd frontend
npx playwright install
```

**Run Tests:**
```bash
# Run smoke tests
npx playwright test tests/e2e/15_smoke_clean_new_app_mode.spec.ts
# Run all E2E tests
npx playwright test
```

## 5. Docker Runtime
To start the full stack:
```bash
docker compose up -d --build
```
Verify health:
```bash
docker compose ps
```

## 6. Seed & Reset
To reset the lab state (remove projects/evidence while keeping frameworks):
```bash
cd backend
python manage.py reset_lab_state --confirm
```

## 7. AI Demo Mode
To run without external AI provider calls, ensure `.env` has:
`AI_DEMO_MODE=True`

## 8. Minimum Gate Before PR
1. `pytest` passes.
2. `npm run build` passes.
3. `npx playwright test tests/e2e/15_smoke_clean_new_app_mode.spec.ts` passes.
4. Contract documentation in `docs/_contracts/` is updated.