# Deep-Link and Orientation Polish

## Objective
Improve operator orientation when entering subroutes directly (bookmark, copied URL, or jump navigation) without broad redesign.

## Reusable primitive added
1. `frontend/components/common/workflow-context-strip.tsx`
   - compact “Where you are” strip
   - current task + next action guidance
   - optional role hint
   - quick route links back to workflow context

## Deep-link surfaces polished
Applied `WorkflowContextStrip` to:
1. `ProjectWorklistScreen`
2. `ProjectRecurringScreen`
3. `ProjectInspectionScreen`
4. `ProjectReadinessScreen`
5. `ProjectExportHistoryScreen`
6. `ProjectPrintPackScreen`
7. `IndicatorDetailScreen`

Each now provides:
- route scope context
- current-state guidance
- recommended next step
- compact navigation back to project/worklist flow

## Long-session indicator orientation improvement
Indicator detail gained a sticky session strip:
- shows active section (`Readiness` → `Governance / Override`)
- persists “current section” awareness during long interactions
- includes project/worklist return affordance
- avoids clutter by reusing existing section model and compact text

Implementation:
- `frontend/components/screens/indicator-detail-screen.tsx`

## Why this helps
1. Reduces cognitive reset when deep-linking into middle workflow steps.
2. Makes next action explicit without requiring prior navigation context.
3. Improves long-session continuity on indicator detail with minimal UI footprint.
