# Runtime Truth Map

## Application locations
- Frontend app: `frontend/` (Next.js)
- Backend app: `backend/` (Django + DRF)
- Reverse proxy: `infra/caddy/Caddyfile`
- Orchestration: `docker-compose.yml`

## Services, containers, ports
- `frontend` → container `accrediops-frontend` → internal `3000` → external via Caddy `18080`
- `backend` → container `accrediops-backend` → internal `8000` → external via Caddy `18080/api/*`
- `caddy` → container `accrediops-caddy` → internal `8080` (published as host `18080`)

## Internal URLs
- Frontend to backend: `http://backend:8000`
- Caddy to frontend: `http://frontend:3000`
- Caddy to backend: `http://backend:8000`

## Browser-facing URLs
- App root: `http://localhost:18080/`
- API: `http://localhost:18080/api/...`
- Frontend health: `http://localhost:18080/health/frontend`
- Backend health: `http://localhost:18080/health/backend`
- Protected API endpoints may return 401/403 if unauthenticated (expected).

## Host-domain ingress mapping
- `https://phc.alshifalab.pk` -> host Caddy -> `127.0.0.1:18080` (AccrediOps app)
- `https://api.phc.alshifalab.pk` -> host Caddy -> `127.0.0.1:18080` (AccrediOps app/API path routing)
- There is no separate PHC Streamlit target in active routing for AccrediOps.

## Frontend API base behavior
- Frontend calls `/api/*`.
- Next rewrite proxies `/api/*` to backend (via `BACKEND_API_URL` / `NEXT_PUBLIC_API_BASE_URL` fallback).
- `next.config.ts` normalizes trailing slashes and strips duplicate `/api` suffix.

## SSR / backchannel rules
- Server-side Next rewrites handle backend API forwarding.
- No direct browser hardcoded backend host required when accessed through Caddy.

## Static/media
- Frontend static served by Next runtime.
- Backend static/media not separately mounted yet; API payload and frontend route assets are current production path.

## Required environment variables
- Backend: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, DB vars.
- Frontend: `BACKEND_API_URL` (preferred), optional `NEXT_PUBLIC_API_BASE_URL`.
- Compose defaults are in `docker-compose.yml`.

## Startup sequence
1. Build images (`docker compose build`).
2. Start backend (migrate + runserver).
3. Start frontend (Next dev server).
4. Start Caddy proxy.
5. Run smoke verification (`scripts/devops/smoke_verify.sh`).

## Health endpoints
- Backend: `/api/health/`
- Frontend: `/healthz`
- Proxy checks:
  - `/health/backend` (Caddy rewrite to backend health)
  - `/health/frontend` (Caddy rewrite to frontend health)
