# 11 Playwright suite map

Suite root: `frontend/tests/e2e/`

1. `00_runtime_and_auth.spec.ts` — runtime/health/login/logout checks.
2. `01_lab_framework_integrity.spec.ts` — LAB presence + indicator count 119.
3. `02_project_create_and_initialize.spec.ts` — ADMIN/LEAD create, OWNER blocked.
4. `03_projects_navigation_and_overview.spec.ts` — list/overview/navigation guidance.
5. `04_worklist_core.spec.ts` — filters + show-all + no 5xx.
6. `05_indicator_detail_and_actions.spec.ts` — indicator sections render and action surface.
7. `06_evidence_lifecycle.spec.ts` — add/review/version/current evidence lifecycle.
8. `07_review_and_approval_lifecycle.spec.ts` — start/review/met + invalid transition block.
9. `08_recurring_workflows.spec.ts` — submit/approve recurring instance.
10. `09_ai_advisory_non_mutation.spec.ts` — AI generate/accept without workflow mutation.
11. `10_readiness_inspection_exports.spec.ts` — readiness/inspection/export and OWNER restriction UX.
12. `11_clone_and_reuse.spec.ts` — clone structure parity and source integrity.
13. `12_admin_surfaces.spec.ts` — admin route reachability sweep.
14. `13_role_visibility_and_authorization.spec.ts` — role discoverability and route gating.
15. `14_regression_500s_and_console_errors.spec.ts` — pageerror/console/requestfailed/5xx monitors.
16. `15_smoke_clean_new_app_mode.spec.ts` — LAB-only smoke and first-project flow.
