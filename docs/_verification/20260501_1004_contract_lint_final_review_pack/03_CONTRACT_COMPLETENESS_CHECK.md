# Contract Completeness Check

## Command
- `python3 scripts/check_contract_docs.py`

## Result
- Exit code: 0
- Status: PASS

Raw output captured in: `_contract_check_output.txt`

## What the check enforces (current behavior)
- Contract folder exists.
- Required files exist.
- No file is empty / heading-only.
- No TODO/TBD/FIXME/fill-later/placeholder markers present.
- Minimum “meaningful (non-empty, non-heading) line” thresholds per file.
- Required mapping docs must contain at least one markdown table:
  - `01_API_ROUTE_CONTRACT.md`
  - `02_FRONTEND_SCREEN_CONTRACT.md`
  - `03_FRONTEND_ACTION_TO_BACKEND_MAP.md`
  - `04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md`
  - `06_RBAC_CAPABILITY_CONTRACT.md`
  - `07_STATUS_WORKFLOW_CONTRACT.md`

## Files checked
The check validates the following files under `docs/_contracts/20260430_2003_frontend_backend_contract_update/`:
- `INDEX.md`
- `00_CONTRACT_OVERVIEW.md`
- `01_API_ROUTE_CONTRACT.md`
- `02_FRONTEND_SCREEN_CONTRACT.md`
- `03_FRONTEND_ACTION_TO_BACKEND_MAP.md`
- `04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md`
- `05_DATA_FIELD_CONTRACT.md`
- `06_RBAC_CAPABILITY_CONTRACT.md`
- `07_STATUS_WORKFLOW_CONTRACT.md`
- `08_TESTING_CONTRACT.md`
- `09_DRIFT_PREVENTION_RULES.md`
- `10_CONTRACT_GAPS_AND_DECISIONS.md`

## CI suitability
- Non-interactive: Yes
- Deterministic: Yes
- Recommended CI usage: add a job step running `python3 scripts/check_contract_docs.py`.

## Known limitation (documented gap)
- This check does **not** currently verify completeness vs actual backend URL patterns or frontend route list; it is a structural/placeholder gate.
