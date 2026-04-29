# Coverage-Closure + Operational Polish Plan

## Scope
This sprint focused only on known quality gaps after governance + UX stabilization:
- Dedicated coverage for print-pack and status-semantics UI surfaces.
- Deep-link orientation polish for major project subroutes.
- Long-session orientation support on indicator detail.
- Formal reporting for backend/frontend/E2E confidence.

## Undercovered surfaces at sprint start
1. `ProjectPrintPackScreen` had no dedicated frontend unit test for primary states.
2. Status semantics helper/component layer lacked explicit isolated coverage:
   - `frontend/utils/status-semantics.ts`
   - `frontend/components/common/status-semantic-badge.tsx`
   - `frontend/components/common/global-status-legend.tsx`
3. Deep-link screens depended mostly on onboarding/help text, with limited route-context strips.
4. Indicator long-session orientation did not persist active section context in a sticky way.

## Closure strategy
1. Add behavior-oriented tests (not snapshot-only) for print-pack + status semantics.
2. Introduce a reusable context primitive (`WorkflowContextStrip`) and apply it surgically on deep-linkable operational routes.
3. Add compact sticky session orientation on indicator detail tied to active section state.
4. Run full verification + measured coverage reporting, explicitly calling out measured vs inferred confidence.

## What remains indirect after this sprint
1. Some low-level visual concerns (spacing/typography exactness) remain E2E-validated rather than isolated unit assertions.
2. Certain server-only app route wrappers (`app/.../page.tsx`) remain indirectly covered via screen tests/E2E.
3. Backend overall line coverage remains below 90% despite strong feature-governance confidence.
