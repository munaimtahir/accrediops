# AI Action Center Truth Map

| AI Check | Result | Status | Evidence | Fix Needed |
|---|---|---|---|---|
| 1. Backend app/module for AI exists? | yes | MATCHED_E2E | `backend/apps/ai_actions/`, `backend/apps/api/views/ai_actions.py` | none |
| 2. `GeneratedOutput` model exists? | yes | MATCHED_E2E | `backend/apps/ai_actions/models/generated_output.py:7-38` | none |
| 3. `/api/ai/generate/` exists? | yes | MATCHED_E2E | `backend/apps/api/urls.py:181-182`, `views/ai_actions.py:30-39` | none |
| 4. Frontend API client function for AI exists? | yes | MATCHED_E2E | `frontend/lib/hooks/use-mutations.ts:182-198` | none |
| 5. Frontend component for AI exists? | yes | MATCHED_E2E | `frontend/components/screens/indicator-detail-screen.tsx:858-939` | none |
| 6. Component mounted anywhere? | yes, in indicator detail page only | MATCHED_E2E | `frontend/app/(workbench)/project-indicators/[id]/page.tsx:1-10` | none |
| 7. Visible navigation item for AI exists? | no | MISSING | no sidebar/topbar/admin nav item references AI | add explicit entry point if product expects AI Center |
| 8. AI panel embedded in indicator detail page? | yes | MATCHED_E2E | `indicator-detail-screen.tsx:858-939` | none |
| 9. Visible AI-labelled buttons exist? | yes: `AI / Assist`, `Generate guidance`, `Generate draft`, `Generate assessment`, `Accept output` | MATCHED_E2E | `indicator-detail-screen.tsx:201,870-891,919-926` | none |
| 10. Which role can see it? | full page visible to authenticated users; AI buttons enabled for OWNER/LEAD/ADMIN in frontend | ROLE_MISMATCH | `indicator-detail-screen.tsx:160-167` | align to assigned-owner backend rule |
| 11. Can a real user reach it by clicking through UI? | yes, but not from primary worklist cards; reachable from recurring queue `Open indicator` links and direct URL | INVISIBLE_UI | `project-recurring-screen.tsx:158-166,224-232`; main worklist uses drawer only `project-worklist-screen.tsx:383-423` | expose link from primary worklist/drawer or sidebar |
| 12. Does clicking it call backend? | yes | MATCHED_E2E | runtime Playwright pass; `09_ai_advisory_non_mutation.spec.ts:19-30,39-42` | none |
| 13. Is generated output shown to user? | yes | MATCHED_E2E | `indicator-detail-screen.tsx:894-931` | none |
| 14. Is generated output saved? | yes | MATCHED_E2E | `AIGenerateView` persists `GeneratedOutput`; model exists | none |
| 15. Is there an accept/apply button? | yes | MATCHED_E2E | `indicator-detail-screen.tsx:919-926` | none |
| 16. Governance risk? | medium | ROLE_MISMATCH | AI is advisory-only in UI copy, but route discoverability is poor and frontend role checks are broader than backend assignment rules | align permission checks and add tests for denied unassigned owners |

| AI Backend/API Item | Exists? | Frontend Visible? | Mounted? | Reachable? | Role Visible? | Status | Evidence |
|---|---|---|---|---|---|---|---|
| `GeneratedOutput` model | yes | n/a | n/a | n/a | n/a | MATCHED_E2E | `generated_output.py:7-38` |
| `GET /api/project-indicators/:id/ai-outputs/` | yes | yes on detail page | yes | yes via detail route | authenticated | MATCHED_E2E | `use-indicator.ts:17-22` |
| `POST /api/ai/generate/` | yes | yes on detail page | yes | yes via detail route | OWNER/LEAD/ADMIN in UI; assigned-owner backend | MATCHED_E2E | `use-mutations.ts:182-188`, Playwright spec |
| `POST /api/ai/outputs/:id/accept/` | yes | yes on detail page | yes | yes via detail route | OWNER/LEAD/ADMIN in UI; assigned-owner backend | MATCHED_E2E | `use-mutations.ts:191-197` |
| Indicator-detail AI panel | yes | yes | yes | yes, but not from primary worklist cards | all can see tab, only owner/lead/admin can act | MATCHED_E2E | `indicator-detail-screen.tsx:858-939` |
| Standalone AI Action Center route/page | no | no | no | no | no | MISSING | no route file, no sidebar entry |
| AI controls in `IndicatorDrawer` (primary worklist path) | no | no | no | no | no | INVISIBLE_UI | drawer has no AI action section, only AI count summary `indicator-drawer.tsx:301-311` |

## Final AI classification

- Product owner-visible "AI Action Center": `INVISIBLE_UI`
- Embedded indicator-detail AI workflow: `MATCHED_E2E`

## Why the owner likely could not see AI

1. The sidebar has no AI item.
2. The main worklist tiles open `IndicatorDrawer`, not the full indicator detail route.
3. `IndicatorDrawer` exposes no AI generate/accept controls.
4. The full AI panel is on `/project-indicators/:id`, and that route is linked from recurring queue, not from the main worklist cards.
