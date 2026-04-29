# 24 — Deployment Truth Map

## Code/runtime linkage
- Repository branch: `main`.
- AccrediOps runtime containers active:
  - `accrediops-backend`
  - `accrediops-frontend`
  - `accrediops-caddy`
- Host Caddy PHC domain routes target AccrediOps Caddy at `127.0.0.1:18080`.

## Domain flow
- `https://phc.alshifalab.pk` -> host Caddy -> AccrediOps Caddy -> frontend/backend split by path.
- `/api/*` routes to backend.
- non-API routes to frontend.

## Evidence
- `docker_ps.txt`
- `docker_images.txt`
- `compose_config.txt`
- `caddy_relevant_config.txt`
- `live_headers.txt`
