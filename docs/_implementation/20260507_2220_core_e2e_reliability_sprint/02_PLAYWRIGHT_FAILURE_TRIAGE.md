# 02 — Playwright Failure Triage

## Will this help the final objective?
Yes — identifies why the core accreditation journeys are not reliably protected by E2E and defines the minimal fixes to restore a trustworthy regression gate.

Evidence: `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_playwright_full.txt`

Baseline summary:
- Total: 80
- Passed: 49
- Failed: 27
- Flaky: 4
- Skipped: 0

## Failure classification

| Test file | Test name | Failure type | Product bug? | Root cause | Fix strategy | Priority |
|---|---|---:|---|---|---|---:|
| `tests/e2e/core-journeys.spec.ts` | evidence review journey works end-to-end | 5 | No | Helper hard-codes `search=E2E-IND-001` but no such indicator exists deterministically, so `/api/dashboard/worklist/` lookup fails. | Make helper select a real indicator deterministically (poll worklist, pick first result) and remove hard-coded search. | 1 |
| `tests/e2e/core-journeys.spec.ts` | recurring approval from indicator context works | 5 | No | Same as above. | Same helper fix. | 1 |
| `tests/e2e/core-journeys.spec.ts` | create flow supports client profile linkage | 6/5 | Likely no | Often fails when modal/state is not ready or select options are slow; also depends on deterministic seed client profile. | Add explicit waits for modal controls and ensure seed creates “E2E Client Profile” deterministically (if required). | 1 |
| `tests/e2e/core-journeys.spec.ts` | clone project then open cloned workspace | 6/5 | Unknown | Likely depends on project list ordering / “Open project” link presence and timing. | Stabilize selectors + wait for project card CTA; use deterministic seeded project. | 1 |
| `tests/e2e/core-journeys.spec.ts` | export lifecycle creates history row with persisted status | 5/6 | Unknown | Likely dependent on export history seed and/or readiness gating and API timing. | Improve seed/export determinism or wait for export history row. | 1 |
| `tests/e2e/core-journeys.spec.ts` | combined governance path: create, evidence, recurring, export | 5/6 | Unknown | Cascade failure from earlier helper/seed/timing issues. | Fix root causes; add resilient waits. | 1 |
| `tests/e2e/30_phc_lab_framework_full_workflow.spec.ts` | PHC LAB lifecycle works end-to-end (core happy path) | 1 | Yes | Draft promotion API returns 500 during “promote draft to evidence”. | Reproduce via API; fix backend promote path; add targeted test to prevent regressions. | 1 |
| `tests/e2e/app-flows.spec.ts` | post-login operational journey route opens from project home | 2/8 | Unknown | Likely selector/route mismatch from project home CTA changes (“Open Worklist” / “Pending actions” etc). | Update selectors to stable role-based / data-testid; align copy expectations with current UX. | 1 |
| `tests/e2e/12_admin_surfaces.spec.ts` | admin dashboard/users/masters/audit/import logs/overrides are reachable | 3/8 | No | Admin heading/copy changed (topbar shows “Accreditation Operations”); sidebar label for `/admin` is “Settings”, while tests expect “Admin Dashboard”. | Align sidebar label to “Admin Dashboard” and update tests to assert stable landmarks/routes instead of brittle heading text. | 3 |
| `tests/e2e/13_role_visibility_and_authorization.spec.ts` | admin has admin discoverability and create CTA | 7/3 | No | “Admin Dashboard” link text not present (sidebar label is “Settings”). | Rename label or update test expectation; ensure admin discoverability remains. | 2 |
| `tests/e2e/13_role_visibility_and_authorization.spec.ts` | lead sees admin navigation and can access admin route | 7/3 | No | Same link-label mismatch; plus ensure Lead is intended to see admin navigation section. | Align UI link label; verify capability rules. | 2 |
| `tests/e2e/17_recurring_and_masters_capability_fix.spec.ts` | Recurring queue row action visibility | 7/6 | Unknown | UI action visibility differs by role/capability; possibly stale assertion on row actions. | Re-check capability flags, use stable selectors, fix UI gating if incorrect. | 2 |
| `tests/e2e/cta-visibility.spec.ts` | admin project create and admin actions are visible | 7/2 | Unknown | Admin CTA/link names don’t match (again “Admin Dashboard” label). | Align label/selectors; verify create CTA is enabled for admin. | 2 |
| `tests/e2e/role-based-access.spec.ts` | admin can open admin dashboard | 7/2 | No | Admin dashboard link label mismatch (“Settings” vs “Admin Dashboard”). | Align label/selectors. | 2 |
| `tests/e2e/role-visibility.spec.ts` | owner sees disabled create project CTA with explanation | 7/3 | Unknown | Owner UX may hide CTA instead of showing disabled rationale, or copy differs. | Align UX to “visible but disabled with rationale” if that’s the intended governed UX; otherwise update tests and document. | 2 |
| `tests/e2e/cta-discoverability.spec.ts` | owner sees disabled create CTA with role rationale | 7/3 | Unknown | Same as above; dependent on consistent CTA behavior across pages. | Standardize disabled CTA + rationale component. | 2 |
| `tests/e2e/role-visibility.spec.ts` | lead sees admin navigation section | 7/2 | Unknown | Admin section label/link names differ. | Align UI nav labels; verify Lead visibility matches policy. | 2 |
| `tests/e2e/role-visibility.spec.ts` | owner sees disabled readiness/export CTAs and guarded routes | 7/3 | Unknown | Readiness/export entry points may be hidden or copy changed. | Standardize “disabled with rationale” affordances where routes are guarded. | 2 |
| `tests/e2e/workflow-guidance.spec.ts` | project overview shows next-step guidance and grouped pathways | 4/3 | Unknown | Guidance copy/sectioning changed; assertions too brittle. | Switch to structural assertions (section headings, presence of pathway cards) or add stable testids. | 3 |
| `tests/e2e/workflow-guidance.spec.ts` | worklist and recurring screens provide action guidance | 4/3 | Unknown | Same as above. | Same strategy. | 3 |
| `tests/e2e/admin-import-validation.spec.ts` | admin validate sample enforces required inputs and completes with CSV upload | 6/5 | Unknown | Timing/seed or file upload expectations changed; may depend on import validation endpoints. | Stabilize upload flow (waits) or update test to current validation UI. | 3 |
| `tests/e2e/15_smoke_clean_new_app_mode.spec.ts` | app stays LAB-only and first-project flow remains smooth | 4/5 | Unknown | Likely fails due to UI copy assumptions (LAB-only messaging / first-run guidance). | Update to structural assertions; ensure seed is clean/deterministic. | 3 |
| `tests/e2e/19_accessibility.spec.ts` | dashboard exposes skip link and keyboard-reachable main actions | 9 | Possibly | Skip link exists, but keyboard focus/CTA reachability assertions may not match current DOM order. | Fix accessibility behavior if broken; otherwise update selectors to correct landmarks/roles. | 6 |
| `tests/e2e/core-journeys.spec.ts` | admin route access is available after login | 7/2 | Unknown | Route discoverability assertion relies on label; could also be auth/session state. | Align admin nav label; ensure `/admin` is reachable for admin. | 2 |
| `tests/e2e/core-journeys.spec.ts` | admin override reopens met indicator and audit evidence is visible | 1/5 | Unknown | Either real override bug or seed/indicator selection non-deterministic. | Fix indicator selection deterministically; then validate override workflow. | 1 |
| `tests/e2e/core-journeys.spec.ts` | non-admin user cannot reopen met indicator | 7/5 | Unknown | Depends on prior override state/indicator selection; may be cascading. | Fix deterministic setup; assert 403 and hidden controls for non-admin. | 1 |

## Flaky tests (baseline)
From `docs/_implementation/20260507_2220_core_e2e_reliability_sprint/phase1_playwright_full.txt`:
- `tests/e2e/18_simplified_navigation_and_homepage.spec.ts` — Simplified project dashboard (retry passed)
- `tests/e2e/18_simplified_navigation_and_homepage.spec.ts` — AI discoverability from worklist (retry passed)
- `tests/e2e/cta-discoverability.spec.ts` — print pack and export CTA entry points are visible from project home (retry passed)
- `tests/e2e/next-action-consistency.spec.ts` — target screens all show action/reason/status guidance (retry passed)

