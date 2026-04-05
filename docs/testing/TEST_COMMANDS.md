# Test Commands

## Backend tests
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python3 manage.py test
pytest
```

Coverage outputs:
- `backend/coverage.xml`
- `backend/htmlcov/`

## Frontend tests
```bash
cd frontend
npm install
npm run test
npm run test:coverage
```

## Frontend production build
```bash
cd frontend
npm run build
```

## Playwright E2E
```bash
cd frontend
npx playwright install
npm run test:e2e
```

If backend auth policy or route mount differs by deployment profile, ensure smoke endpoints are verified first:
```bash
cd ..
./scripts/devops/smoke_verify.sh
```

Outputs:
- `OUT/playwright/` (repo root)
- `playwright-report/` (repo root)

## Full local verification sequence
```bash
./scripts/devops/rebuild_up.sh
./scripts/devops/smoke_verify.sh
./scripts/testing/run_backend_tests.sh
./scripts/testing/run_frontend_tests.sh
./scripts/testing/run_e2e.sh
```
