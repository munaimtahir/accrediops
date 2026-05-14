# Baseline From Verification

This document records the state of the application at the beginning of the Evidence Bridge Test Hardening Sprint, as reproduced from the findings of the `docs/_verification/20260511_1211_final_architecture_alignment_drift_verification/` sprint.

## 1. Initial Commands

| Command | Result | Notes |
|---|---|---|
| `pwd` | Success | `/home/munaim/srv/apps/accrediops` |
| `git status --short` | Success | Showed untracked sprint directory. |
| `backend/.venv/bin/python -m py_compile ...` | Success | No syntax errors. |
| `backend/.venv/bin/python backend/manage.py check` | Success | System check identified no issues. |
| `backend/.venv/bin/python backend/manage.py makemigrations --check --dry-run` | **Contradiction** | Command passed with "No changes detected". This contradicted the verification report, which stated this check failed. See `02_MIGRATION_DRIFT_ANALYSIS.md` for the investigation. |
| `backend/.venv/bin/python backend/manage.py showmigrations` | Success | All migrations reported as applied, including the `EvidenceRequirementSuggestion` migration in the `indicators` app. |

## 2. Test Reproduction

The primary goal of the baseline was to reproduce the failing backend tests.

**Command:**
`backend/.venv/bin/python -m pytest -q --maxfail=5 backend/`

**Result:** **SUCCESSFULLY REPRODUCED**

The test suite failed with 5 errors in `backend/apps/exports/tests/test_services.py`, all within the `ExportEligibilityReportTests` class.

**Key Failures:**

*   `FAILED ...::test_eligibility_happy_path`: `AssertionError: False is not true`
*   `FAILED ...::test_eligibility_with_high_risk_indicators`: `AssertionError: 2 != 1`
*   `FAILED ...::test_eligibility_with_low_recurring_compliance`: `AssertionError: 2 != 1`
*   `FAILED ...::test_eligibility_with_multiple_reasons`: `AssertionError: '...' not found in '...'`
*   `FAILED ...::test_eligibility_with_pending_indicators`: `AssertionError: 3 != 1`

These failures confirmed that the `export_eligibility_report` service was not behaving as expected and was the correct primary target for this sprint's repair work.
