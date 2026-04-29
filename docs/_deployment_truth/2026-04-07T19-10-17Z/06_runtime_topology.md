# Runtime Topology

## Branch / repo state
- Repo: `/home/munaim/srv/apps/accrediops`
- Branch: `main`
- Recent commits captured in:
  - `OUT/deployment_truth/2026-04-07T19-10-17Z/git_log_head.txt`

## Active deployment services (AccrediOps)
- `accrediops-frontend` (Next.js)
- `accrediops-backend` (Django/DRF)
- `accrediops-caddy` (reverse proxy)

## Serving path
- Public endpoint: `http://127.0.0.1:18080`
- Caddy route map:
  - `/api/*` -> backend
  - default -> frontend
  - health proxy endpoints for frontend/backend

## Build execution model
- Frontend built in Docker container (`npm install`, `npm run build`, `next start`).
- Backend launched with migrations then Django runserver in compose.

## Host-level multi-app coexistence
Parallel frontends also active:
- `fmu_frontend` (`127.0.0.1:8080`)
- `pgsims_frontend` (`127.0.0.1:8082`)
- other unrelated stacks

This required strict base-url verification to avoid reading another app as AccrediOps.

