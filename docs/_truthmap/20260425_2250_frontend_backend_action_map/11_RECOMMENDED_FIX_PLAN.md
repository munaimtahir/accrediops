# Recommended Fix Plan

## Priority 1: Broken or invisible core actions

| Priority | Gap | Required Fix | Files Likely Involved | Acceptance Criteria |
|---|---|---|---|---|
| P1 | Full indicator detail route not discoverable from main worklist | add explicit `Open detail` link/button from worklist tiles or drawer | `frontend/components/worklist/indicator-status-tile.tsx`, `frontend/components/screens/indicator-drawer.tsx`, `frontend/components/screens/project-worklist-screen.tsx` | user can open `/project-indicators/:id` from primary worklist without URL hacking |
| P1 | AI only visible on full detail, not drawer/primary flow | expose AI entry point from main operator path | same plus `indicator-detail-screen.tsx` | user can discover AI from main worklist/project flow |
| P1 | `Return` label is wired to generic reopen endpoint | either rename button/dialog to `Reopen` everywhere or implement a distinct return workflow | `frontend/components/screens/indicator-detail-screen.tsx` | label semantics match backend behavior |

## Priority 2: Backend-only endpoints that need UI

| Priority | Gap | Required Fix | Files Likely Involved | Acceptance Criteria |
|---|---|---|---|---|
| P2 | master-value patch endpoint has no UI | add inline edit control in admin masters table | `frontend/components/screens/admin-masters-screen.tsx`, `frontend/lib/hooks/use-admin.ts` | admin can edit an existing master row through UI and patch endpoint is exercised |

## Priority 3: Frontend-only actions that need APIs

| Priority | Gap | Required Fix | Files Likely Involved | Acceptance Criteria |
|---|---|---|---|---|
| P3 | comments are expected but not implemented end-to-end | add comment API and visible comment form per indicator comment type | backend indicators/api URLs/views/serializers; `indicator-detail-screen.tsx` or drawer | user can add working/review/approval comments and see them in audit trail |
| P3 | no evidence delete lifecycle | add governed delete/archive endpoint and UI if product requires full evidence lifecycle | backend evidence API + indicator detail | admin/owner can remove or archive evidence with auditability |

## Priority 4: Role mismatch fixes

| Priority | Gap | Required Fix | Files Likely Involved | Acceptance Criteria |
|---|---|---|---|---|
| P4 | frontend role checks ignore assignment | derive action enablement from assignment-aware detail payload or add dedicated capability flags in API response | `indicator-detail-screen.tsx`, `indicator-drawer.tsx`, `project-recurring-screen.tsx`, backend detail serializer/view if needed | unassigned OWNER/REVIEWER/APPROVER cannot trigger buttons that backend will deny |
| P4 | print-pack page lacks export role guard | reuse `canViewExports` gating on print-pack page | `project-print-pack-screen.tsx`, `lib/authz.ts` | non-admin/non-lead sees restricted UX consistent with export history |
| P4 | project client-profile page exposes admin-only APIs broadly | make non-admin/non-lead route read-only or gate route/content | `project-client-profile-screen.tsx`, `client-profile-form.tsx`, `lib/authz.ts` | non-admin/non-lead cannot hit profile write/preview actions from visible UI |
| P4 | admin overrides page visible to LEAD but reopen endpoint is ADMIN-only | either narrow frontend page/action to ADMIN or broaden backend intentionally | `admin-overrides-screen.tsx`, `lib/authz.ts`, backend permissions if policy changes | LEAD no longer sees executable control that backend denies |

## Priority 5: Lab/FMS module visibility

| Priority | Gap | Required Fix | Files Likely Involved | Acceptance Criteria |
|---|---|---|---|---|
| P5 | LAB exists as framework content, not a distinct module | confirm product expectation: framework data vs separate module | product spec + navigation components if needed | truth map and backlog stop conflating seeded LAB framework with standalone Lab/FMS module |

## Priority 6: AI Action Center visibility and wiring

| Priority | Gap | Required Fix | Files Likely Involved | Acceptance Criteria |
|---|---|---|---|---|
| P6 | backend exists but UI is effectively invisible in main flow | mount AI action panel inside the primary indicator workflow surface and/or add a visible card/button labelled `AI Action Center` or `Generate Action Plan` | `frontend/components/screens/indicator-drawer.tsx`, `frontend/components/screens/project-worklist-screen.tsx`, optionally `sidebar.tsx` | product owner can reach AI by clicking through standard UI without direct URL |
| P6 | AI output discoverability/history limited | show latest generated output preview in drawer or add explicit link from drawer to full detail AI panel | `indicator-drawer.tsx`, `indicator-detail-screen.tsx` | operator can see where AI output lives from primary flow |
| P6 | AI permission mismatch | use assignment-aware capability flags instead of role-only checks | backend detail serializer/view + AI controls | unassigned owner cannot see enabled AI action buttons |
| P6 | test coverage should reflect discoverability | add Playwright test that confirms visible AI CTA from standard operator path and verifies `/api/ai/generate/` network call | `frontend/tests/e2e/` | test fails if AI becomes hidden again |

## Specific AI recommendation

- Mount a compact AI panel inside `IndicatorDrawer` or add a visible `Open AI Action Center` link from the drawer to `/project-indicators/:id`.
- Label the entry point explicitly: `AI Action Center` or `Generate Action Plan`.
- Keep AI advisory-only.
- Do not let AI mark indicators complete.
- Apply role/assignment visibility according to governance rules.
- Add Playwright coverage that begins from `/projects/:id/worklist`, reaches AI, and verifies `/api/ai/generate/` is called.
