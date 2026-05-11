# 03 — Backend Reliability Implementation

## Will this help the final objective?
Yes — these changes strengthen workflow invariants around evidence lifecycle and AI drafting safety (configuration failures and governed promotion).

## What changed

### Tests added
- Evidence service lifecycle tests:
  - `backend/apps/evidence/tests/test_services.py`
    - source field validation (URL requires `file_or_url`, TEXT_NOTE requires `text_content`)
    - versioning behavior (same title increments `version_no` and flips `is_current`)
    - updating reviewed evidence versions a new record
    - reviewer status validation rejects unsupported values
- Workflow transition guard tests:
  - `backend/apps/workflow/tests/test_transitions.py`
    - invalid transition raises `ValidationError`
    - expected transition allowed
- Document drafting hardening tests (API level):
  - `backend/apps/api/tests/test_document_drafting.py`
    - missing AI key returns 400 with clear message
    - provider failure returns 400 with safe message
    - promotion does not auto-mark the indicator MET
    - non-admin role denied admin draft endpoints

### Bug fixed / safety rule enforced
- `backend/apps/ai_actions/services/document_drafting.py`
  - Enforces AI configuration validation in non-demo mode (clear error when provider/model/key missing).
  - Logs failed AI usage attempts for configuration errors.

## Commands run (evidence)
Outputs saved:
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase3_manage_check.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase3_makemigrations_check_dryrun.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase3_pytest_cov.txt`

## Results
- `python3 manage.py check`: PASS
- `python3 manage.py makemigrations --check --dry-run`: PASS (no changes detected)
- `pytest --cov --cov-report=term-missing`: **134 passed**
- Total backend coverage: **83%** (targeted improvements without fake coverage chasing)

## Notes / justified non-goals
- No attempt made to increase coverage for management commands or low-value admin list endpoints.
- This phase did not implement any new product features (AI documentation workflow UI/backends beyond safety hardening) — it only improved reliability and safety around existing behavior.

