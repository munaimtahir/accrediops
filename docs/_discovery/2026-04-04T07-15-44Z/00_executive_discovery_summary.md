# Executive Discovery Summary

## Project purpose
AccrediOps is an internal accreditation operations workbench focused on governed indicators, evidence-first execution, recurring evidence obligations, readiness/inspection views, exports, and admin controls.

## Current architecture shape
- **Frontend:** Next.js App Router (`frontend/app/(workbench)/*`) with client-side React Query hooks to `/api/*`.
- **Backend:** Django + DRF (`backend/apps/*`) with modular apps for accounts, projects, indicators, evidence, recurring, AI actions, exports, audit, workflow.
- **Proxy/runtime:** Caddy path routing, root UI + `/api/*` backend routing.

## Active runtime topology (verified)
- Frontend routes render from root and workbench pages.
- Backend health endpoint resolves.
- Frontend health endpoint resolves.
- Workbench auth guard redirects protected pages to login when unauthenticated.

## Main frontend surface areas
- Projects list and project overview
- Project worklist (grouped by area/standard)
- Indicator detail (workflow commands + evidence + recurring + AI)
- Recurring queue
- Readiness / inspection
- Exports + print pack preview
- Client profile + variable preview
- Admin screens (dashboard/users/masters/audit/overrides/import logs)

## Main backend modules
- `projects`, `indicators`, `evidence`, `recurring`, `ai_actions`, `exports`, `workflow`, `audit`, `accounts`, `api`.

## Testing surface (current verified)
- Backend API tests: **25 passing**
- Backend coverage (line): **83%**
- Frontend Vitest: **9 passing**
- Playwright discovery suite: **6 passed / 3 failed**

## Probable risk zones
1. API contract doctrine drift: OpenAPI file is still placeholder (`paths: {}`) while implementation is large.
2. Project creation UX gap: project list screen has no “new project” flow despite backend POST support.
3. Playwright auth/runtime consistency: login-protected route expectations drifted from current runtime behavior.
4. Some admin/override behavior is list/visibility-oriented rather than full action workflows in UI.
