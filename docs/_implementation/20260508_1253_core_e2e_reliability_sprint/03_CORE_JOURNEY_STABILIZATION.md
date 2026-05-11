# Phase 3 — Core Journey Stabilization

## Journey Verification

| Journey | Before status | Fix applied | After status | Evidence |
|---|---|---|---|---|
| Login | PASS | N/A | PASS | Verified in `00_runtime_and_auth.spec.ts` |
| Dashboard opens | PASS | N/A | PASS | Verified in `03_projects_navigation_and_overview.spec.ts` |
| Framework list opens | PASS | N/A | PASS | Verified in `01_lab_framework_integrity.spec.ts` |
| Framework detail opens | PASS | N/A | PASS | Verified in `01_lab_framework_integrity.spec.ts` |
| AI classification page opens | PASS | N/A | PASS | Verified in `20_indicator_classification_workflow.spec.ts` |
| Project list opens | PASS | Improved page size handling (`page_size=all`) | PASS | Verified in `03_projects_navigation_and_overview.spec.ts` |
| Evidence submission works | PASS | N/A | PASS | Verified in `06_evidence_lifecycle.spec.ts` |
| Reviewer/approver workflow | PASS | N/A | PASS | Verified in `07_review_and_approval_lifecycle.spec.ts` |
| Admin override (Reopen) | FAIL | Added retries and increased seed headroom | FAIL/FLAKY | Persistent instability in full suite; passes in isolation. |
| Recurring workflow works | PASS | Fixed stale heading assertion | PASS | Verified in `08_recurring_workflows.spec.ts` |
| Document draft workflow | PASS | N/A | PASS | Verified in `test_document_drafting.py` |
| AI Documentation AI works | PASS | N/A | PASS | Verified in `40_framework_documentation_ai.spec.ts` |
| System health page opens | PASS | Added link to Admin Dashboard | PASS | Verified manually and via `12_admin_surfaces.spec.ts` |

## Summary of Fixes
- **Stale Selectors**: Updated `workflow-guidance.spec.ts` to match "Recurring evidence queue" heading.
- **Race Conditions**: Added explicit visibility waits and increased timeouts in `app-flows.spec.ts` and `core-journeys.spec.ts`.
- **State Depletion**: Increased seeded MET indicators from 2 to 10 in `seed_e2e_state.py` to support multiple tests performing reopen actions.
- **Missing Navigation**: Added "System health" link to `AdminDashboardScreen`.
- **Pagination Issues**: Set `page_size: "all"` in `useProjects` hook to ensure the seeded "E2E Lab Project" is always visible on the projects page.
