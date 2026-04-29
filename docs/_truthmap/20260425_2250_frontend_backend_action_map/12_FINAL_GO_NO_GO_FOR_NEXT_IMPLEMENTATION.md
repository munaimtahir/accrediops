# Final Go / No-Go For Next Implementation

## Decision

`CONDITIONAL GO`

## Why

- The frontend/backend map is now concrete enough to start implementation of missing wiring without guessing.
- The main remaining risk is not unknown code; it is misleading completeness assumptions, especially around AI discoverability and assignment-aware permissions.

## Biggest confirmed missing actions

- No standalone visible AI Action Center route or nav item.
- No comment-create API or UI.
- No evidence delete flow.
- No UI for editing existing master rows despite patch endpoint.
- No obvious main-worklist path into full indicator detail page where AI lives.

## Backend-only endpoints

- `PATCH /api/admin/masters/<key>/<pk>/`

## Frontend-only buttons/actions

- pending-actions print
- projects power-table toggle
- panel tabs/local view toggles

## Invisible components

- AI generate/accept controls are invisible from the primary worklist flow because that flow stops at `IndicatorDrawer`.

## AI Action Center true status

- Final status: `INVISIBLE_UI`
- Qualification: the embedded indicator-detail AI workflow itself is mounted and runtime-verified, but the product-level AI center claim is not supported by normal navigation.

## Recommended first implementation task

- Add an explicit path from the primary worklist/drawer to the full indicator detail AI surface, or embed the AI CTA directly in the drawer.
- Immediately after that, align frontend action enablement with backend assignment-aware permissions.
