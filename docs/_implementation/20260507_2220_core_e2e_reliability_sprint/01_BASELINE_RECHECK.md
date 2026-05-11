# 01 — Baseline Recheck

## Will this help the final objective?
Yes — confirms the current baseline matches the prior sprint and provides an evidence-backed starting point for E2E stabilization.

## Results

| Area | Result | Details |
|---|---|---|
| Backend check | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_manage_check.txt` |
| Migration check | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_makemigrations_check_dryrun.txt` |
| Backend tests | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_pytest_cov.txt` |
| Backend coverage | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_pytest_cov.txt` (TOTAL 83%) |
| Frontend lint | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_frontend_lint.txt` |
| Frontend typecheck | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_frontend_typecheck.txt` |
| Frontend unit tests | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_frontend_test.txt` (53 passed) |
| Frontend build | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_frontend_build.txt` |
| Docker health | PASS | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_docker_compose_ps.txt` + curls: `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_curl_backend_health.txt`, `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_curl_frontend_healthz.txt` |
| Playwright full run | FAIL | `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_playwright_full.txt` (49 passed, 27 failed, 4 flaky; 80 total) |

## Playwright baseline notes
- Prior sprint before/after reference: `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/05_PLAYWRIGHT_FINAL_RESULTS.md`
- This sprint uses a fresh full run to establish the current failing set and confirm whether it matches the prior sprint.

### Full failing test list (current baseline)
From `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_playwright_full.txt`:
- `tests/e2e/12_admin_surfaces.spec.ts` — admin dashboard/users/masters/audit/import logs/overrides are reachable
- `tests/e2e/13_role_visibility_and_authorization.spec.ts` — admin has admin discoverability and create CTA
- `tests/e2e/13_role_visibility_and_authorization.spec.ts` — lead sees admin navigation and can access admin route
- `tests/e2e/15_smoke_clean_new_app_mode.spec.ts` — app stays LAB-only and first-project flow remains smooth
- `tests/e2e/17_recurring_and_masters_capability_fix.spec.ts` — Recurring queue row action visibility
- `tests/e2e/19_accessibility.spec.ts` — dashboard exposes skip link and keyboard-reachable main actions
- `tests/e2e/30_phc_lab_framework_full_workflow.spec.ts` — PHC LAB lifecycle works end-to-end (core happy path)
- `tests/e2e/admin-import-validation.spec.ts` — admin validate sample enforces required inputs and completes with CSV upload
- `tests/e2e/app-flows.spec.ts` — post-login operational journey route opens from project home
- `tests/e2e/core-journeys.spec.ts` — evidence review journey works end-to-end
- `tests/e2e/core-journeys.spec.ts` — recurring approval from indicator context works
- `tests/e2e/core-journeys.spec.ts` — create flow supports client profile linkage
- `tests/e2e/core-journeys.spec.ts` — clone project then open cloned workspace
- `tests/e2e/core-journeys.spec.ts` — admin route access is available after login
- `tests/e2e/core-journeys.spec.ts` — admin override reopens met indicator and audit evidence is visible
- `tests/e2e/core-journeys.spec.ts` — non-admin user cannot reopen met indicator
- `tests/e2e/core-journeys.spec.ts` — export lifecycle creates history row with persisted status
- `tests/e2e/core-journeys.spec.ts` — combined governance path: create, evidence, recurring, export
- `tests/e2e/cta-discoverability.spec.ts` — owner sees disabled create CTA with role rationale
- `tests/e2e/cta-visibility.spec.ts` — admin project create and admin actions are visible
- `tests/e2e/operator-first-time.spec.ts` — first-time operator journey stays explicit across create, evidence, review, and approval
- `tests/e2e/role-based-access.spec.ts` — admin can open admin dashboard
- `tests/e2e/role-visibility.spec.ts` — owner sees disabled create project CTA with explanation
- `tests/e2e/role-visibility.spec.ts` — lead sees admin navigation section
- `tests/e2e/role-visibility.spec.ts` — owner sees disabled readiness/export CTAs and guarded routes
- `tests/e2e/workflow-guidance.spec.ts` — project overview shows next-step guidance and grouped pathways
- `tests/e2e/workflow-guidance.spec.ts` — worklist and recurring screens provide action guidance

### Flaky tests (current baseline)
From `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_playwright_full.txt`:
- `tests/e2e/18_simplified_navigation_and_homepage.spec.ts` — Simplified project dashboard
- `tests/e2e/18_simplified_navigation_and_homepage.spec.ts` — AI discoverability from worklist
- `tests/e2e/cta-discoverability.spec.ts` — print pack and export CTA entry points are visible from project home
- `tests/e2e/next-action-consistency.spec.ts` — target screens all show action, reason, and status guidance

### Does baseline match previous sprint?
- **Failing set**: matches the previously reported “27 failed” cluster.
- **Flaky count**: increased (previous sprint reported 1 flaky; this baseline run reports 4 flaky).
