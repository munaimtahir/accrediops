# Docker Runtime Status

Record `docker compose` runtime health and service logs.

## Compose Files Detected

- `docker-compose.yml` at repo root.

## Commands Executed

Executed on 2026-05-01 (UTC):

- `docker compose up -d --build`
- `docker compose ps`
- `docker compose logs --tail=100 backend`
- `docker compose logs --tail=100 frontend`
- `docker compose logs --tail=100 caddy`
- `curl -fsS http://127.0.0.1:18080/api/health/`
- `curl -I http://127.0.0.1:18080/healthz`

## Results

`docker compose ps`:

- `accrediops-backend`: Up (healthy)
- `accrediops-frontend`: Up (healthy)
- `accrediops-caddy`: Up

Backend health endpoint via Caddy:

- `GET http://127.0.0.1:18080/api/health/`: `{"status":"ok","database":"ok"}` (success wrapper)

Frontend health endpoint via Caddy:

- `GET http://127.0.0.1:18080/healthz`: `200 OK` (response headers observed)

Logs (high level):

- Backend: “No migrations to apply”; Django dev server started; repeated `/api/health/` returning 200.
- Frontend: build completed then `next start` on `0.0.0.0:3000`; reported “Healthy”.
- Caddy: started with configured Caddyfile and exposed `0.0.0.0:18080->8080`.

## Status Classification

- Docker runtime: VERIFIED BY RUNTIME
- Backend health: VERIFIED BY RUNTIME
- Frontend health: VERIFIED BY RUNTIME

