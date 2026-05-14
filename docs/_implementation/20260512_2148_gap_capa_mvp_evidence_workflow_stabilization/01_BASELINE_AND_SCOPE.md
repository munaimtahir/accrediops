# Baseline and Scope

This document establishes the starting conditions and scope for the "Final ZIP Export Engine & Recurring Workflow Stabilization Sprint".

## 1. Previous Sprint Context
The preceding "Gap and CAPA MVP + Evidence Workflow Stabilization Sprint" concluded with a `GO` verdict. Key achievements included:
- Gap model implemented.
- CAPA model implemented.
- CAPA lifecycle operational.
- CAPA APIs complete.
- CAPA frontend MVP complete (badges, summaries).
- Readiness/export integration connected and CAPA-aware.
- Stale `MISSING` status bug in E2E resolved.
- Backend targeted tests passed.
- Frontend unit tests passed.
- Targeted E2E (evidence/CAPA flow) passed.

## 2. Current Verified Status (Baseline)
The baseline verification was performed at the start of this sprint.

### Backend:
-   **`python -m py_compile backend/apps/ai_actions/services/document_drafting.py`:** Passed.
-   **`python manage.py check`:** Passed.
-   **`python manage.py makemigrations --check --dry-run`:** Passed (no changes detected).
-   **`python manage.py migrate`:** Passed (no migrations to apply).
-   **`pytest -q backend/apps/indicators backend/apps/evidence backend/apps/exports backend/apps/api`:** **PASSED** (121 tests, 0 failures).

### Frontend:
-   **`npm run lint`:** Passed (with 2 pre-existing warnings).
-   **`npm run typecheck`:** Passed.
-   **`npm run build`:** Passed.
-   **`npm test` (Vitest):** Passed (54 tests).

### E2E Targeted (Evidence/CAPA Flow):
-   **Tests Run:** `30_phc_lab_framework_full_workflow.spec.ts`, `operator-first-time.spec.ts`.
-   **Result:** **PASSED** (4/4 tests passed). This confirms the stability of the evidence bridge and CAPA integration end-to-end.

### E2E Targeted (Recurring Workflow Baseline):
-   **Tests Run:** `08_recurring_workflows.spec.ts`, `17_recurring_and_masters_capability_fix.spec.ts`, `workflow-guidance.spec.ts`, `core-journeys.spec.ts`.
-   **Result:** **FAILED** (as expected). These failures represent the target of the secondary objective of this sprint.

## 3. Sprint Goals
The main objective is to implement and verify the physical final ZIP export engine. The secondary objective is to stabilize recurring workflow E2E failures.

### Core Goals:
1.  **Final ZIP Export Engine:** Implement a backend service to create a comprehensive ZIP export (including reports, evidence, CAPA data) with a dynamic folder structure, expose it via API, and align minimal frontend UI.
2.  **Recurring Workflow Stabilization:** Analyze and fix existing E2E failures in recurring workflows.

### Product Identity to Preserve:
*   AccrediOps is a framework-first, indicator-driven, evidence-based accreditation operating system.
*   Central unit of work remains the Indicator.
*   AI remains advisory only.

## 4. Scope Lock
*   **Do not ask for confirmation.**
*   **Do not stop after planning.**
*   **Do not build full final ZIP export in this sprint.**
*   **Do not redesign the whole frontend.**
*   **Do not build advanced CAPA analytics.**
*   **Do not create duplicate CAPA or Gap models.**
*   **Do not change Caddy, DNS, production routing, or unrelated server apps.**
*   **Do not delete tests to force success.**
*   **Do not hide failures.**
