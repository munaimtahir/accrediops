# Auth and E2E Stabilization

## Root causes identified
1. **Base URL/runtime mismatch** in Playwright against active proxy route.
2. **Non-deterministic auth data/state** (seed user/framework assumptions drifting).
3. **Selector brittleness** in modal/login flow due duplicate text and strict-mode collisions.
4. **Protected-route timing sensitivity** around client-side auth guard redirects.

## Exact fixes applied
- Set Playwright base URL to proxy runtime: `http://127.0.0.1:18080`.
- Added deterministic global setup (`frontend/tests/e2e/global-setup.cjs`) to seed:
  - `e2e_admin` (ADMIN role, password)
  - framework/area/standard/indicator needed for create-init flow.
- Reworked E2E selectors and flow assertions in `frontend/tests/e2e/app-flows.spec.ts`:
  - explicit `/login` checks
  - scoped modal/form interactions
  - stable post-create assertions.
- Adjusted modal layout (`frontend/components/common/modal.tsx`) for reliable interaction and viewport behavior.

## Stable login baseline strategy
- Seed login identity at test start, not as implicit fixture precondition.
- Assert unauthenticated redirect behavior first (`/projects` -> `/login?next=...`).
- Reuse a single helper login routine with expected URL transition.

## Protected-route behavior expectation
- Workbench routes under `(workbench)` are guarded by `AuthGuard`.
- If unauthenticated:
  - client route replace to `/login?next=...`
  - fallback hard navigation ensures redirect even if client transition stalls.

## Updated Playwright assumptions
- Login page must expose:
  - heading/text `AccrediOps sign-in`
  - labeled `Username` and `Password` inputs.
- Projects page must expose `Project register` and create action for admin.
- Create flow uses real backend APIs and expects project workspace URL `/projects/{id}`.
- Health probes remain reachable via proxy (`/health/backend`, `/health/frontend`).
