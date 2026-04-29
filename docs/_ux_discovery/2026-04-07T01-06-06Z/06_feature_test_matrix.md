# Feature → Test Matrix

| Feature | Backend test | Frontend test | E2E test | Status |
| --- | --- | --- | --- | --- |
| Project creation + discoverability + role gating | `test_project_create_and_initialize.py`, `test_governance_hardening.py` | `create-project-form.test.tsx`, `project-list-screen.test.tsx` | `cta-discoverability.spec.ts`, `role-visibility.spec.ts`, `core-journeys.spec.ts` | Covered |
| Indicator workflow clarity (ordered sections + command flow) | `test_mark_met_and_progress.py`, `test_governance_hardening.py` | `indicator-detail-screen.test.tsx` | `ui-clarity.spec.ts`, `core-journeys.spec.ts` | Covered |
| Evidence upload/review (evidence-first) | `test_evidence_and_ai.py`, `test_governance_hardening.py` | `evidence-form.test.tsx` | `core-journeys.spec.ts` | Covered |
| Recurring submit/approve lifecycle | `test_recurring_queue.py`, `test_governance_hardening.py` | `recurring-screen.test.tsx` | `core-journeys.spec.ts`, `workflow-guidance.spec.ts` | Covered |
| Admin override + audit visibility | `test_governance_hardening.py`, `test_admin_registry.py` | `admin-dashboard-screen.test.tsx` | `core-journeys.spec.ts`, `role-visibility.spec.ts` | Covered |
| Export lifecycle + permission boundaries | `test_admin_readiness_inspection_exports.py`, `test_governance_hardening.py` | `export-history-screen.test.tsx` | `core-journeys.spec.ts`, `cta-discoverability.spec.ts`, `role-visibility.spec.ts` | Covered |
| Clone project reuse engine | `test_clone_project.py` | `project-overview-screen.test.tsx` (clone action gating) | `core-journeys.spec.ts` | Covered |
| Variable replacement + client profile flow | `test_variable_replacement.py` | `project-management-form.test.tsx` | `core-journeys.spec.ts` (client profile linkage) | Covered |
| Print pack structure + access | `test_print_pack.py` | *(No dedicated screen unit test yet)* | `cta-discoverability.spec.ts` | Partially covered |
| Physical evidence tracking fields | `test_physical_evidence.py`, `test_print_pack.py` | `evidence-form.test.tsx` | `core-journeys.spec.ts` (evidence add path) | Covered |
| Navigation + role visibility model | `test_governance_hardening.py` (policy) | `sidebar.test.tsx`, `app-shell.test.tsx` | `role-visibility.spec.ts`, `workflow-guidance.spec.ts` | Covered |
| Global status semantics + legend consistency | *(Indirect via readiness/export tests)* | `worklist-screen.test.tsx` (legend surface), screen tests | `ui-clarity.spec.ts`, `workflow-guidance.spec.ts` | Partially covered |

## Coverage note
- Critical workflow features now have backend + frontend + E2E coverage paths.
- Remaining test depth gaps are in dedicated unit tests for print-pack screen rendering and status-semantic component behavior.
