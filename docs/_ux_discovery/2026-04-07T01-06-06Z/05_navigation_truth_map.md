# Navigation Truth Map

## Primary navigation model
1. **Projects** is the operator home and first-action surface.
2. **Current project** subtree carries execution workflows:
   - Overview
   - Worklist
   - Recurring
   - Inspection
   - Readiness
   - Exports
   - Print pack
   - Client profile
3. **Admin** is separated and now shown only to ADMIN role.

## IA clarity improvements applied
- Sidebar grouped into clear operational/admin regions.
- “Viewing as {ROLE}” context shown to reduce role confusion.
- Project-level routes present explicit execution intent (operate, review, export, print).
- Topbar exposes global status legend for cross-screen semantic consistency.

## Discoverability checkpoints
- `/projects` has visible first-step CTA and empty-state guidance.
- `/projects/{id}` surfaces shortcuts to worklist/exports/print-pack.
- `/project-indicators/{id}` section switcher reflects canonical operational order.
- `/admin/*` removed from non-admin side navigation to reduce false affordance.

## Remaining IA risks
- Deep-linking directly into subroutes can bypass contextual guidance banners; add route-local mini-intro blocks where missing.
- Status legend in topbar is compact; some users may still need expanded legend affordance on dense screens.
