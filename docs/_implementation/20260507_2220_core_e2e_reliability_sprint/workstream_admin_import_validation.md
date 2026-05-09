Will this help the final objective?
YES — this stabilizes the Admin Import Validation E2E path so accreditation workflow regressions are caught reliably.

# Admin Import Validation workstream

## Failure classification
- Test: `frontend/tests/e2e/admin-import-validation.spec.ts`
- Failure type: Seed/state + race/timing (sqlite lock) + auth storage-state flakiness in Playwright `global-setup`
- Product bug? No (product endpoints worked); the failure was in E2E harness determinism.

## Root cause
- Playwright `global-setup` runs `seed_e2e_state` against a SQLite DB that can be briefly write-locked during concurrent access, causing `django.db.utils.OperationalError: database is locked`.
- StorageState generation previously depended on navigating to `/projects` and waiting for a URL change, which could fail even when login endpoints succeed (redirect loop or slow client navigation), blocking the whole spec before it even ran.

## Fix applied (minimal, keeps test intent)
- Hardened `frontend/tests/e2e/global-setup.cjs`:
  - Added retry/backoff for `seed_e2e_state` when SQLite reports `database is locked`.
  - Reworked storageState generation to verify authentication via `/api/auth/session/` instead of requiring `/projects` navigation to succeed.
  - Kept a UI-login fallback if fetch-based login does not persist a session.

## Verification
- Command: `npx playwright test tests/e2e/admin-import-validation.spec.ts`
- Result: PASS (2/2)
- Raw output: `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/admin-import-validation_20260508_0811.txt`

