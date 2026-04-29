# Playwright Visual Verification Plan

## Runtime status

- Local frontend/backend stack was reachable on `http://127.0.0.1:18080`.
- Existing auth state files were present in `frontend/tests/e2e/.auth/`.
- Focused runtime verification was executed safely against the local environment only.

| Route | Role | Screenshot Captured? | Visible Actions Found | Network Calls Captured | Status | Evidence |
|---|---|---|---|---|---|---|
| `/project-indicators/:id` | admin | no retained screenshot because test passed | `AI / Assist` tab, existing AI output row | `POST /api/ai/generate/`, `POST /api/ai/outputs/:id/accept/`, detail reload | MATCHED_E2E | `frontend/tests/e2e/09_ai_advisory_non_mutation.spec.ts` passed locally |
| `/projects` | all seeded roles | not re-run in this audit, but covered by existing suite | create button/admin nav role differences | existing tests cover login/visibility | UNTESTED in this run | `frontend/tests/e2e/00_runtime_and_auth.spec.ts`, `13_role_visibility_and_authorization.spec.ts` |
| `/projects/:id/worklist` | admin | not re-run in this audit | indicator cards open drawer, no AI action visible in drawer | expected worklist/detail/evidence calls | UNTESTED in this run | static evidence in `project-worklist-screen.tsx` and `indicator-drawer.tsx` |
| `/projects/:id/recurring` | admin | not re-run in this audit | `Open indicator`, `Submit` | recurring queue + submit calls expected | UNTESTED in this run | static evidence plus route links in `project-recurring-screen.tsx` |

## AI-specific visual verification

- Verified:
  - indicator detail route is reachable
  - `AI / Assist` tab is visible
  - generated AI output is rendered after generation
  - accepting AI output does not mutate workflow status
- Not verified in this run:
  - sidebar screenshot showing lack of AI nav item
  - worklist screenshot showing drawer lacks AI controls
  - multi-role AI visibility runtime sweep

## Recommended follow-up Playwright checks

1. Add/extend a spec that starts from `/projects/:id/worklist`, clicks an indicator card, and asserts that the drawer contains no AI generate controls.
2. Add a complementary spec that starts from `/projects/:id/recurring`, clicks `Open indicator`, and asserts the full detail page contains AI controls.
3. Add role-specific denial tests for an unassigned OWNER attempting AI generation.
4. Capture screenshots for:
   - sidebar/topbar with no AI nav item
   - worklist drawer
   - full indicator detail AI panel
