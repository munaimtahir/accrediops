# Frontend/Backend Truth Map

- Audit date: `2026-04-25 22:50 UTC`
- Repo state audited: current working tree, including pre-existing uncommitted changes
- Scope: discovery only, no application logic changes
- Runtime spot-checks:
  - `http://127.0.0.1:18080/health/frontend` returned `200 OK`
  - `GET /api/health/` returned `{"status":"ok","service":"accrediops-backend","database":"ok"}`
  - `frontend/tests/e2e/09_ai_advisory_non_mutation.spec.ts` passed locally

## Headline findings

1. The backend surface is materially broader than the product owner-visible UI in the primary worklist flow.
2. The main worklist and workspace board open `IndicatorDrawer`, not the full indicator detail page. The drawer has no AI generate/accept controls.
3. A mounted AI panel does exist in `frontend/components/screens/indicator-detail-screen.tsx`, backed by `/api/ai/generate/` and `/api/ai/outputs/:id/accept/`.
4. The AI panel is not surfaced as a standalone "AI Center" route or sidebar item, and it is not reachable from the primary worklist cards. It is reachable through recurring queue "Open indicator" links and direct URL access.
5. Project owner feedback of "No AI Center is visible in the frontend" is directionally correct for the main navigation and primary operator flow.
6. Comments are represented in backend models and indicator detail payloads, but there is no comments API and no visible add-comment UI. Working notes are implemented through `update-working-state`, not through comment creation.
7. Status history is visible as read-only embedded data on indicator detail; there is no dedicated status-history endpoint or page action.
8. Admin surfaces are present and broadly wired: users, audit, overrides, frameworks, import validation/logs, client profiles, masters, and health.
9. Exports are wired in two ways:
   - preview/download-style payload endpoints: excel, print-bundle, physical retrieval
   - export job lifecycle endpoint: `POST /api/exports/projects/:id/generate/` plus history
10. One confirmed backend-only endpoint exists: `PATCH /api/admin/masters/<key>/<pk>/` has no visible edit control in `AdminMastersScreen`.

## AI Action Center conclusion

- Product-level classification: `INVISIBLE_UI`
- Embedded indicator-detail AI workflow classification: `MATCHED_E2E`
- Reason: the AI panel is mounted and runtime-verified, but the claimed "AI Center" is not visible in navigation and is absent from the primary worklist/drawer flow that most users will take.

## Counts used in this report

| Metric | Count |
|---|---:|
| Frontend routes/pages reviewed | 29 |
| Backend API endpoints reviewed | 62 |
| Frontend visible actions inventoried | 69 |
| Frontend actions with backend matches | 56 |
| Frontend-only / local-only actions | 4 |
| Backend-only endpoints | 1 |
| Expected product actions marked missing or broken | 13 |

## Decision

- Final decision: `CONDITIONAL GO`
- Reason: the truth map is sufficiently concrete to begin targeted implementation work, but not all product claims previously called "complete" are actually discoverable from the mounted UI.
