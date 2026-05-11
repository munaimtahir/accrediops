# Docker and Environment Audit

## Docker Setup Check
- **Command:** `docker compose config` (dry run inspection)
- **Status:** PASS (Syntactically correct).

## Environment Configuration
- **Required Services:** `backend` (Django), `frontend` (Next.js), `caddy` (Reverse Proxy).
- **Required Ports:** `18080` (Caddy maps `18080` locally for internal proxying).
- **Volumes:** Persists `node_modules`, `.next` cache, and Caddy data/config.
- **Dependencies:** Caddy waits for both `frontend` and `backend` to be `service_healthy`. Frontend waits for `backend` to be `service_healthy`.
- **Healthchecks:**
  - Backend: `urllib.request.urlopen` against `/api/health/`.
  - Frontend: `fetch` against `/healthz`.

## Local Dev vs Production
- The `docker-compose.yml` serves as both a dev-capable runner and a production-like structure. It forces production environment defaults (`NODE_ENV: production`, `DJANGO_DEBUG: "False"`).
- `DJANGO_ALLOWED_HOSTS` includes domains like `phc.alshifalab.pk`.
- It executes `npm install` and `npm run build` on every startup for the frontend container, which causes significant startup delays (over 5 minutes, leading to local timeouts during verification).

## Risks
- The frontend container's startup command (`npm install --include=dev && npm run build && npm run start`) is highly anti-pattern for a production container, as it forces a rebuild on every start and requires dev dependencies inside the runtime container. This explains the timeouts.
