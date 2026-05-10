# PHASE 11 — NEXT WORK ORDER PROMPT

Based on the current status and identified blockers, the following work order is recommended:

## Recommended Next Work Order: Evidence Pack Blocker Resolution Sprint (Part B)

### Objective

The primary objective of this sprint is to **resolve the critical blockers** preventing the Evidence Pack Builder from functioning and to restore full test stability. Until these blockers are addressed, further feature development is severely impeded.

### Key Tasks

1.  **Resolve Backend 500 Internal Server Error in `build_print_bundle`:**
    *   **Focus:** Obtain a clear Python traceback for the `AttributeError: 'NoneType' object has no attribute 'get_full_name'` in `backend/apps/exports/services.py`. This may require:
        *   Deep dive into Django's test client and DRF's exception handling configurations to prevent traceback suppression.
        *   Manual debugging within the `build_print_bundle` function with print statements or a debugger in a controlled environment (e.g., local Django shell).
        *   Carefully inspect `project_indicator.owner`, `reviewer`, `approver` relationships and the data being assigned in the test setup.
    *   **Goal:** `test_evidence_pack.py` and other backend export-related tests pass successfully.

2.  **Resolve Playwright E2E `seed_e2e_state` Silent Timeout:**
    *   **Focus:** Diagnose and fix the silent timeout of `docker compose exec backend python manage.py seed_e2e_state`. This will require:
        *   Running the command with maximum verbosity (`-v 3` or `DEBUG=True` in settings) if possible.
        *   Adding debug logging within the `seed_e2e_state` management command itself to identify the point of failure.
        *   Checking Docker container logs (`docker compose logs backend`) for any relevant output.
        *   Verifying Python environment within the container (e.g., missing packages, path issues).
    *   **Goal:** `seed_e2e_state` command completes successfully and allows Playwright tests to execute.

### Sub-Tasks after Blockers are Resolved

*   **Re-enable and pass `test_evidence_pack.py`:** Once the `build_print_bundle` error is fixed, fully verify the backend implementation.
*   **Run Playwright E2E Test:** After `seed_e2e_state` is fixed, run `inspection-pack.spec.ts` to verify frontend rendering (this test will need to be re-created).
*   **Run full backend and E2E suites:** Ensure overall system stability.

### Decision Logic for Next Sprint (from previous plan)

Based on the blockers:

*   The evidence pack is **incomplete** due to backend failures.
*   Playwright is **unstable** (blocked).

Therefore, the recommended work order falls under: **C. If evidence pack is incomplete: Recommend Evidence Pack Completion Sprint.** However, this specifically needs to target the blocker resolution first.

## Sprint Title for Next Work Order

**Evidence Pack Blocker Resolution Sprint (Part B)**
