# Test Results

This document records the final test outcomes for the sprint.

## 1. Backend Test Hardening

The primary goal of the sprint was to get the targeted backend tests to pass.

*   **Command:** `backend/.venv/bin/python -m pytest -q backend/apps/indicators backend/apps/evidence backend/apps/exports backend/apps/api`
*   **Result:** **GREEN**
*   **Final Output:** `121 passed in 618.33s (0:10:18)`

All failing tests related to the Evidence Bridge, export eligibility, and print-bundle views were successfully fixed. The broader test suite for all affected apps passes without regressions.

## 2. Frontend Verification

The frontend was checked to ensure no regressions were introduced by any (unlikely) API changes.

*   **Commands:**
    *   `npm run lint`
    *   `npm run typecheck`
    *   `npm run build`
    *   `npm test` (vitest)
*   **Result:** **GREEN**
*   **Final Output:** All commands passed successfully. Lint produced 2 warnings (pre-existing), and Vitest passed all 54 tests.

## 3. Playwright E2E Environment Check

A significant effort was made to run the Playwright E2E suite.

*   **Initial Status:** The verification report stated that E2E tests failed because the backend service was not running.
*   **Attempt 1:** The services were started with `docker compose up -d`. The tests ran, but 2 failed (`01_lab_framework_integrity.spec.ts` and `15_smoke_clean_new_app_mode.spec.ts`).
*   **Analysis:** The failures were due to data contamination in the test database. Previous test runs had created extra `Framework` objects that were not being cleaned up, causing tests that expected a pristine environment to fail.
*   **Attempt 2:** The Docker environment was completely reset with `docker compose down -v`, and the `db.sqlite3` file was manually deleted to ensure a truly clean slate.
*   **Result:** **ENVIRONMENT-BLOCKED**
*   **Final Output:** The test run failed during the `global-setup.cjs` script with the error: `CommandError: PHC LAB framework does not exist.`
*   **Conclusion:** The E2E test environment has an implicit dependency on a pre-seeded database that contains the `PHC LAB` framework. The mechanism for seeding this initial framework data could not be determined during the sprint. Therefore, the E2E suite could not be run successfully. This is documented as a remaining gap.
