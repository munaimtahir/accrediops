# 04 — Playwright Failure Triage

## Will this help the final objective?
Yes — the core accreditation workflow must remain reliable in the browser. Stabilizing E2E coverage protects the workflow as AI drafting and evidence governance evolve.

## Run evidence
Initial run (failed because proxy not running):
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_playwright_run1.txt`

Docker started to provide `http://127.0.0.1:18080`:
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_docker_compose_config.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_docker_compose_up.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_docker_compose_ps.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_curl_frontend_healthz.txt`
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_curl_backend_health.txt`

Playwright run (with server available):
- `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_playwright_run2.txt`
- Failure list extracted from reporter JSON:
  - `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_playwright_failures_list.txt`
  - `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase4_playwright_failure_errors_excerpt.txt`

## Summary (from `OUT/playwright/results.json`)
- Total tests: 79
- Passed: 44
- Failed: 35
- Flaky: 0
- Skipped: 0

Artifacts:
- Traces/screenshots/videos: `OUT/playwright/`
- HTML report: `playwright-report/`

## Failure classification table (initial triage)

| Test file | Test name | Failure type | Product bug? | Root cause | Fix approach |
|---|---|---:|---:|---|---|
| `03_projects_navigation_and_overview.spec.ts` | project list and overview surfaces are navigable with clear next-step guidance | 2 | Likely | Missing `data-testid="next-action-banner"` / changed guidance component | Re-add/standardize Next Action banner component and testids on project overview. |
| `12_admin_surfaces.spec.ts` | admin dashboard/users/masters/audit/import logs/overrides are reachable | 4 | Possibly | Seed state / nav labels / route protection mismatch | Stabilize admin navigation entries and ensure pages load under admin session. |
| `13_role_visibility_and_authorization.spec.ts` | admin has admin discoverability and create CTA | 8 | Possibly | Capability UI gating or CTA testids changed | Ensure admin CTA + nav visibility matches RBAC rules; add stable selectors. |
| `13_role_visibility_and_authorization.spec.ts` | lead sees admin navigation and can access admin route | 8 | Possibly | Lead role gating differs from expectations | Align UI gating for LEAD with backend permissions (AdminOrLead). |
| `15_smoke_clean_new_app_mode.spec.ts` | app stays LAB-only and first-project flow remains smooth | 4 | Possibly | Seed project/framework assumptions drift | Ensure seed contract remains stable; update seed or test expectations. |
| `17_recurring_and_masters_capability_fix.spec.ts` | Recurring queue row action visibility | 8 | Possibly | Disabled buttons/labels not consistent per role | Make recurring row actions consistent with RBAC and accessibility expectations. |
| `18_simplified_navigation_and_homepage.spec.ts` | Simplified navigation for non-admin | 8 | Likely | Sidebar sections / labels changed | Update nav UI or tests to match current IA; prefer `data-testid` anchors. |
| `18_simplified_navigation_and_homepage.spec.ts` | Simplified project dashboard | 2 | Likely | Missing guidance/CTAs | Restore key CTAs and guidance section on project dashboard. |
| `18_simplified_navigation_and_homepage.spec.ts` | AI discoverability from worklist | 2 | Likely | AI entrypoint not visible / changed | Add clear “AI Action Center”/AI routes entry from worklist; stable selectors. |
| `19_accessibility.spec.ts` | dashboard exposes skip link and keyboard-reachable main actions | 7 | Likely | Missing skip link or focus order | Add skip link + ensure key actions reachable via keyboard. |
| `19_accessibility.spec.ts` | recurring approve modal traps focus, closes with ESC, and submits with ENTER | 7 | Likely | Modal focus management not enforced | Fix modal focus trap/ESC handling; align with accessible modal patterns. |
| `19_accessibility.spec.ts` | disabled recurring actions are announced as disabled by role | 7 | Likely | Disabled states not expressed (aria-disabled) | Add `aria-disabled` + tooltip text for disabled actions. |
| `admin-import-validation.spec.ts` | admin validate sample enforces required inputs and completes with CSV upload | 4 | Possibly | File input selectors or flow drift | Stabilize file upload selectors/testids; ensure import validation endpoint behavior. |
| `app-flows.spec.ts` | 5. post-login operational journey route opens from project home | 2 | Likely | CTA/link missing from project home | Restore “Operate indicators”/next-step link and ensure navigates reliably. |
| `core-journeys.spec.ts` | evidence review journey works end-to-end | 5 | Possibly | Timing/race around evidence creation/review UI | Add waits for network idle + stable testids; fix UI if async state not handled. |
| `core-journeys.spec.ts` | recurring approval from indicator context works | 5 | Possibly | Timing around recurring instance rendering | Stabilize rendering/waits; confirm instances created in seed/init. |
| `core-journeys.spec.ts` | create flow supports client profile linkage | 4 | Possibly | Seed/client-profile UI changed | Ensure client profile selector exists and uses stable selectors. |
| `core-journeys.spec.ts` | clone project then open cloned workspace | 5 | Possibly | Clone operation async/redirect timing | Stabilize loading states and use robust navigation waits. |
| `core-journeys.spec.ts` | admin route access is available after login | 8 | Possibly | Admin nav entry missing | Restore admin nav entry points or align tests to new IA. |
| `core-journeys.spec.ts` | admin override reopens met indicator and audit evidence is visible | 5 | Possibly | Override UI timing / permission gating mismatch | Ensure override controls available to admin and actions complete with clear toast/state. |
| `core-journeys.spec.ts` | non-admin user cannot reopen met indicator | 8 | Likely | UI allows access or error messaging changed | Ensure non-admin cannot see/trigger reopen; test should validate guarded UX. |
| `core-journeys.spec.ts` | export lifecycle creates history row with persisted status | 4 | Possibly | Export history UI/seed assumptions | Stabilize export generation and history rendering; add explicit wait for history row. |
| `core-journeys.spec.ts` | combined governance path: create, evidence, recurring, export | 5 | Possibly | Cascade failures from missing CTAs/guidance | Fix upstream missing CTAs and stabilize multi-step flow. |
| `cta-discoverability.spec.ts` | owner sees disabled create CTA with role rationale | 8 | Likely | Disabled CTA missing or message changed | Add consistent disabled CTA + explanation for OWNER. |
| `cta-discoverability.spec.ts` | print pack and export CTA entry points are visible from project home | 2 | Likely | CTA locations changed | Restore or update CTA placements with stable selectors. |
| `cta-visibility.spec.ts` | project create and admin actions are visible | 2 | Likely | CTA components changed | Ensure admin/lead sees create CTA and admin actions. |
| `next-action-consistency.spec.ts` | target screens all show action, reason, and status guidance | 2 | Likely | Guidance banner missing on some screens | Implement a reusable Next Action panel and include on targeted screens. |
| `operator-first-time.spec.ts` | first-time operator journey stays explicit across create, evidence, review, and approval | 2 | Likely | Missing guidance/empty-state copy | Restore operator-facing guidance and empty states. |
| `role-based-access.spec.ts` | admin can open admin dashboard | 8 | Possibly | Route gating mismatch or nav missing | Confirm admin dashboard route + navigation entry exist and are linked. |
| `role-visibility.spec.ts` | owner sees disabled create project CTA with explanation | 8 | Likely | Disabled CTA not present | Add consistent disabled CTA + explanation text. |
| `role-visibility.spec.ts` | lead sees admin navigation section | 8 | Likely | Lead nav section removed/renamed | Align nav for LEAD with backend capabilities; update selectors. |
| `role-visibility.spec.ts` | owner sees disabled readiness/export CTAs and guarded routes | 8 | Likely | Disabled CTAs missing | Ensure readiness/export CTAs visible but disabled for OWNER with rationale. |
| `workflow-completion.spec.ts` | operator can traverse core workflow screens with explicit next action guidance | 2 | Likely | Missing guidance links | Restore guidance components and stable navigation paths. |
| `workflow-guidance.spec.ts` | project overview shows next-step guidance and grouped pathways | 2 | Likely | Project overview missing “grouped pathways” section | Implement/restore grouped next-step section on project overview. |
| `workflow-guidance.spec.ts` | worklist and recurring screens provide action guidance | 2 | Likely | Missing guidance on worklist/recurring pages | Add Next Action guidance sections + stable testids. |

## Initial diagnosis
The failing set is heavily concentrated in:
- **Guidance/CTA discoverability** (Next Action banners, operator-first-time messaging, CTA visibility)
- **Role-based navigation visibility** (admin/lead sections, owner disabled CTAs)
- **Accessibility behaviors** (skip link, modal focus trap, aria-disabled)

These are workflow-reliability and operator-usability concerns (not cosmetic-only), so they are in-scope and directly support accreditation completion.

