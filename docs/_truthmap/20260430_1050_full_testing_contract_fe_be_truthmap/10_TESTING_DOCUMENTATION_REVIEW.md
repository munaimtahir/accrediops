# Testing Documentation Review

## Current TESTING.md Review
- **Exists:** Partially. There is a `testing_plan.md` in the root, but it lacks specific command instructions.
- **Accuracy:** The documentation does not clearly outline the steps to run tests using `docker-compose` vs local `npm`/`python` commands.

## Proposed TESTING.md Replacement

### 1. Purpose
Define the standard procedures for running the AccrediOps test suite locally and in CI.

### 2. Prerequisites
- Docker & Docker Compose
- Node.js v20+
- Python 3.12+

### 3. Environment Variables
Copy `.env.example` to `.env` in the `backend/` folder before running tests. `DJANGO_SECRET_KEY` and database configs are required.

### 4. Backend Test Commands
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest
```

### 5. Frontend Test Commands
```bash
cd frontend
npm install
npm run test:coverage
```

### 6. Docker Test Commands
To verify the full build process:
```bash
docker compose build
docker compose up -d
```

### 7. Playwright Setup and E2E Tests
```bash
cd frontend
npm ci
npx playwright install --with-deps
npx playwright test
```

### 8. Smoke Tests
Run `npx playwright test tests/e2e/smoke.spec.ts`

### 9. Minimum Test Gate Before Merge
All backend unit tests, frontend type checks (`npm run build`), and smoke tests MUST pass before code is merged. Contract documentation MUST be updated for any API/UI changes.