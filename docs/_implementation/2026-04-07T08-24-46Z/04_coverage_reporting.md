# Coverage Reporting (Measured + Practical Confidence)

## 1) Formal measured results

### Backend (measured via pytest-cov)
- Command: `backend/.venv/bin/pytest apps/api/tests -q`
- Result: **31 passed**
- Overall coverage (apps): **85%**
- Source: `OUT/implementation/2026-04-07T08-24-46Z/backend_coverage_output.txt`

### Frontend (measured via Vitest coverage)
- Command: `npm run test:coverage`
- Result: **17 test files passed, 33 tests passed**
- Reported “All files” line coverage: **50.12%**
- Source: `OUT/implementation/2026-04-07T08-24-46Z/frontend_coverage_output.txt`

### E2E (measured via Playwright)
- Command: `npx playwright test`
- Result: **26 passed**
- Source: `OUT/implementation/2026-04-07T08-24-46Z/playwright_output.txt`

## 2) Build and test stability
- Frontend build: **pass** (`NEXT_DIST_DIR=.next_implementation npm run build`)
- Backend Django tests: **31 passed** (`python3 backend/manage.py test apps.api.tests`)

## 3) Confidence by layer
1. Backend/API confidence: **high** for governed core workflows and regression-protected endpoints; broad app-wide line coverage is below 90%.
2. Frontend behavior confidence: **high** for critical operational surfaces and journey-affecting UX; formal line coverage is below 90%.
3. E2E/operator journey confidence: **high** for core governance + UX paths with full-suite green.

## 4) Explicit truth on targets
The requested 90%+ coverage threshold is **not met** in formal measured terms:
- Backend: 85%
- Frontend: 50.12%

No inflation applied. Current confidence relies on strong behavior/E2E depth plus targeted coverage closure, not high aggregate line percentages.

## 5) What this sprint closed despite percentage limits
1. Dedicated print-pack unit coverage now exists.
2. Status-semantic helper/component direct coverage now exists.
3. Deep-link orientation and long-session indicator orientation are both implemented and covered.
