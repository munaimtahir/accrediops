# AI Visibility Fix

## Truth map gaps addressed

- `GAP-05` `INVISIBLE_UI`: AI controls existed only on full indicator detail, not the primary worklist drawer flow.
- `GAP-06` `INVISIBLE_UI`: full indicator detail route existed but was not surfaced from the main worklist path.

## What changed

- `IndicatorDrawer` now renders a dedicated `AI Action Center` block with:
  - `Open full detail`
  - `Open AI Action Center`
- `Open AI Action Center` links to `/project-indicators/:id?panel=ai`.
- `IndicatorDetailScreen` now reads `panel=ai` and activates the AI panel when requested.
- Existing full-page AI controls were preserved:
  - `Generate guidance`
  - `Generate draft`
  - `Generate assessment`
  - `Accept output`

## Governance

- AI generation and AI acceptance remain advisory-only.
- No AI action mutates indicator workflow status directly.
- Existing advisory semantics were preserved and re-verified by Playwright.

## Verification

- `tests/e2e/16_action_visibility_fix.spec.ts` now proves:
  - worklist tile opens drawer
  - drawer exposes full-detail and AI CTAs
  - AI CTA reaches `/project-indicators/:id?panel=ai`
  - `/api/ai/generate/` is called from normal UI flow
  - workflow status remains unchanged after AI generation
