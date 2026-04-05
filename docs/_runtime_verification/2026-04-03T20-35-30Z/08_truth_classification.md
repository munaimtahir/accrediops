# Truth classification

## WORKING PERFECTLY

- Homepage direct frontend exposure (`/` now served by Next.js app behavior).
- Frontend health endpoint (`/healthz`).
- Backend API health endpoint (`/api/health/`).
- Django admin static assets (`/static/admin/...` return `200`).
- Caddy routing for live domain (`/` to frontend upstream, `/api/*` and `/static/*` to backend upstream as configured).
- Frontend build.
- Frontend Vitest.
- Docker compose bring-up on updated local port mapping (`18080`) for basic status/smoke flow.
- Backend Django tests.
- Backend pytest coverage run (82% total).

## IMPLEMENTED BUT NEEDS DEBUGGING

- Remaining devops script set not rerun end-to-end in one clean pass after all late fixes (`rebuild_up`, `reset_stack`, `frontend_refresh_redeploy`).
- Runtime/environment documentation accuracy (repo docs partly compose-oriented, live host is systemd+Caddy oriented).

## NOT DONE / NOT VERIFIED

- End-to-end rerun of all remaining devops scripts in one sequence after final frontend stabilization.
