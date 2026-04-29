# 06 — Feature Test Matrix

Legend: ✅ covered, ⚠️ partial, ⬜ planned.

| Feature / Journey | Backend test | Frontend/unit test | E2E test | Status |
|---|---|---|---|---|
| Auth login/session/logout | `test_auth_api.py` | `authz.test.ts` + guard tests | `00_runtime_and_auth.spec.ts` | ✅ |
| Create project | `test_project_create_and_initialize.py` | `create-project-form.test.tsx`, `project-list-screen.test.tsx` | `02_project_create_and_initialize.spec.ts`, `cta-visibility.spec.ts` | ✅ |
| Initialize project from framework | `test_project_create_and_initialize.py`, `test_project_initialization.py` | `create-project-form.test.tsx` | `02_project_create_and_initialize.spec.ts` | ✅ |
| Open project + overview flow | `test_project_create_and_initialize.py` | `project-overview-screen.test.tsx` | `03_projects_navigation_and_overview.spec.ts`, `workflow-completion.spec.ts` | ✅ |
| Worklist navigation/filtering | `test_mark_met_and_progress.py` | `worklist-screen.test.tsx`, `project-workspace-board.test.tsx` | `04_worklist_core.spec.ts` | ✅ |
| Indicator structure clarity (8 sections) | `test_mark_met_and_progress.py` | `indicator-detail-screen.test.tsx` | `ui-clarity.spec.ts`, `workflow-completion.spec.ts` | ✅ |
| Indicator assign/update/start/review/met/reopen | `test_governance_hardening.py`, `test_mark_met_and_progress.py` | `indicator-detail-screen.test.tsx`, `indicator-drawer.test.tsx` | `05_indicator_detail_and_actions.spec.ts`, `core-journeys.spec.ts` | ✅ |
| Evidence add/edit/review | `test_evidence_and_ai.py`, `test_physical_evidence.py` | `evidence-form.test.tsx`, `indicator-detail-screen.test.tsx` | `06_evidence_lifecycle.spec.ts`, `core-journeys.spec.ts` | ✅ |
| Recurring submit/approve | `test_recurring_queue.py`, `test_governance_hardening.py` | `recurring-screen.test.tsx` | `08_recurring_workflows.spec.ts`, `core-journeys.spec.ts` | ✅ |
| AI advisory generate/accept | `test_evidence_and_ai.py` | `indicator-detail-screen.test.tsx` | `09_ai_advisory_non_mutation.spec.ts` | ✅ |
| Readiness + inspection | `test_admin_readiness_inspection_exports.py` | `readiness-screen.test.tsx`, `inspection-screen.test.tsx` | `10_readiness_inspection_exports.spec.ts` | ✅ |
| Export lifecycle/history | `test_admin_readiness_inspection_exports.py` | `export-history-screen.test.tsx`, `project-print-pack-screen.test.tsx` | `10_readiness_inspection_exports.spec.ts`, `core-journeys.spec.ts` | ✅ |
| Admin dashboard/surfaces | `test_admin_registry.py` | `admin-dashboard-screen.test.tsx`, `admin-frameworks-screen.test.tsx`, `admin-import-logs-screen.test.tsx` | `12_admin_surfaces.spec.ts` | ✅ |
| Role-based access behavior | `test_governance_hardening.py` | `authz.test.ts`, `admin-area-guard.test.tsx`, `sidebar.test.tsx` | `13_role_visibility_and_authorization.spec.ts`, `role-based-access.spec.ts` | ✅ |
| CTA visibility and discoverability | service + API tests above | `project-list-screen.test.tsx`, `project-overview-screen.test.tsx` | `cta-visibility.spec.ts` | ✅ |
| Workflow completion continuity | `test_mark_met_and_progress.py`, `test_governance_hardening.py` | `indicator-detail-screen.test.tsx` | `workflow-completion.spec.ts`, `07_review_and_approval_lifecycle.spec.ts` | ✅ |
| Negative flows (restricted routes, denied actions, empty states) | `test_governance_hardening.py`, delete/profile tests | `admin-area-guard.test.tsx`, `readiness-screen.test.tsx` | `negative-flows.spec.ts`, `14_regression_500s_and_console_errors.spec.ts` | ✅ |

## Required journey coverage check

| Required journey | E2E coverage |
|---|---|
| Create project → initialize → open | `02_project_create_and_initialize.spec.ts` |
| Navigate → indicators → update | `04_worklist_core.spec.ts`, `05_indicator_detail_and_actions.spec.ts` |
| Upload evidence → review → approval | `06_evidence_lifecycle.spec.ts`, `07_review_and_approval_lifecycle.spec.ts` |
| Recurring submission → approval | `08_recurring_workflows.spec.ts` |
| Admin override → audit trace | `core-journeys.spec.ts`, `12_admin_surfaces.spec.ts` |
| Export → validation | `10_readiness_inspection_exports.spec.ts` |
| Negative paths (wrong role, missing data, empty states) | `negative-flows.spec.ts`, `13_role_visibility_and_authorization.spec.ts` |

## New Playwright files added in this sprint

1. `frontend/tests/e2e/cta-visibility.spec.ts`
2. `frontend/tests/e2e/role-based-access.spec.ts`
3. `frontend/tests/e2e/workflow-completion.spec.ts`
4. `frontend/tests/e2e/negative-flows.spec.ts`
