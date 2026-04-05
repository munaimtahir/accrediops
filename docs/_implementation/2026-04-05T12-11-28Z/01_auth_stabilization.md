# Auth / Login / Protected-Route Stabilization

## Root causes identified
- Playwright auth flow was duplicated across specs, which increased drift risk and made selector/session updates inconsistent.
- The clone journey assertion was racing route transition timing, causing intermittent failures even when clone succeeded.
- Protected-route expectations needed one canonical baseline (`/projects` redirects to login with `next`, then returns after successful auth).

## Exact fixes applied
- Added shared Playwright auth helper: `frontend/tests/e2e/helpers.ts`.
  - Canonical seeded credentials and framework labels are now centralized.
  - Canonical login function: `loginAsSeededAdmin(page)`.
- Refactored specs to use shared helper:
  - `frontend/tests/e2e/app-flows.spec.ts`
  - `frontend/tests/e2e/core-journeys.spec.ts`
- Stabilized clone-route assertion in `core-journeys`:
  - Replaced immediate ID comparison with `waitForURL` predicate to ensure navigation to a different `/projects/{id}` path is complete before asserting heading content.

## Stable login baseline strategy
- Seed deterministic auth user + framework in Playwright global setup (`e2e_admin` / password `x`).
- Always execute login through the shared helper.
- Validate redirect contract once per suite:
  - unauthenticated `/projects` → `/login?next=%2Fprojects`
  - successful login → `/projects`

## Protected-route behavior expectation
- Protected workbench routes are guarded by session query (`/api/auth/session/`).
- If unauthenticated, UI redirects to login with `next`.
- Admin user can access `/admin` after login.

## Updated Playwright assumptions
- Use label-based and role-based selectors only.
- Scope modal interactions to active modal container (`div.fixed.inset-0`). 
- Wait for route transitions on clone/create flows before path-derived assertions.

