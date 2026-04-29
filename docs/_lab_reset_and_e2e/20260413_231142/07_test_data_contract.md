# 07 Test data contract

## Naming contract

- Client baseline: `E2E Lab Client`
- Project baseline: `E2E Lab Project`
- Clone target: `E2E Lab Project Clone`
- Test-generated records: prefix `E2E_` (and `PW_` reserved)

## Auth contract

- Canonical base URL: `http://127.0.0.1:18080`
- Role auth states are stored per role under `frontend/tests/e2e/.auth/`.
- Tests use role-specific storage state selection.

## API/workflow contract

- LAB framework is the only framework under test.
- Worklist `page_size=all` is explicitly exercised and regression-covered.
- Evidence/review/recurring/AI/export flows use governed endpoints only; no permission bypass.
