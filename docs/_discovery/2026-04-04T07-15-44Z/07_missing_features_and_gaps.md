# Missing Features and Gaps

## Fully missing / not exposed
1. **Project creation + initialization frontend path**: backend supports create/initialize, but no clear user-facing create flow discovered in workbench.
2. **Contract-first artifact parity**: OpenAPI remains a placeholder and does not represent actual API truth.

## Half-built / partial
1. **Client profile linkage UX**: profile edit/preview works only after project has a linked profile; first-class linking workflow is weak.
2. **Admin override workflow UX**: override data visibility exists, but action-oriented override flow is limited/unclear from UI.
3. **Playwright coverage depth**: route discoverability improved, but full functional workflows still shallow.

## Misleadingly present / false-complete risk
1. `contracts/openapi/openapi.yaml` suggests contract-first discipline, but currently does not define real routes.
2. Some features appear “covered” by route presence but are only validated at discoverability level, not full operation level.

## Backend-only vs frontend-only mismatch
- **Backend-only capability currently underexposed:** project creation/initialization flow.
- No major frontend-only capabilities without backend route were found for critical surfaces.

## Wired but currently failing verification
- Playwright unauthenticated/protected-route expectations for projects/admin/login tests fail under current runtime behavior (`/login` redirects/selector mismatch).
