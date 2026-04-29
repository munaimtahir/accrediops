# Test Results

## Backend

Passed:

```bash
python3 manage.py check
python3 manage.py makemigrations --check --dry-run
python3 manage.py test apps.api.tests.test_indicator_classification -v 2
python3 manage.py test apps.api.tests.test_ai_generation_gemini apps.api.tests.test_evidence_and_ai -v 2
python3 manage.py test apps.api.tests.test_frameworks_api -v 2
```

Results:

- Classification tests: 14 passed.
- Existing AI/evidence tests: 17 passed.
- Framework import/export tests: 9 passed.

## Frontend

Passed:

```bash
npm run build
npx playwright test tests/e2e/18_simplified_navigation_and_homepage.spec.ts --reporter=list
```

Results:

- Next build passed.
- Simplified navigation and AI discoverability smoke: 4 passed.

## Playwright Classification Spec

Added:

```bash
frontend/tests/e2e/20_indicator_classification_workflow.spec.ts
```

Attempted run against the already-running 18080 frontend failed because that server did not have the newly added route loaded and returned 404.

Attempted run against a temporary 18081 dev server reached login but global setup could not complete login in that isolated dev-server setup. The spec itself uses mocked classification endpoints and remains checked in for the next stable E2E environment run.

Local development DB was migrated with:

```bash
python3 manage.py migrate
```
