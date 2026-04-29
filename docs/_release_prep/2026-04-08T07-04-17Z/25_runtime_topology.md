# 25 — Runtime Topology

## Active topology (AccrediOps slice)
- **Edge/host proxy:** host Caddy (`/etc/caddy/Caddyfile`) with PHC site blocks.
- **App proxy:** `accrediops-caddy` (`:8080`, published as host `:18080`).
- **Frontend app:** `accrediops-frontend` (Next.js, port `3000` internal).
- **Backend app:** `accrediops-backend` (Django, port `8000` internal).

## Routing behavior
- host Caddy domain blocks:
  - `phc.alshifalab.pk` -> `127.0.0.1:18080`
  - `api.phc.alshifalab.pk` -> `127.0.0.1:18080`
- AccrediOps Caddy:
  - `/api/*` -> backend
  - all other paths -> frontend
