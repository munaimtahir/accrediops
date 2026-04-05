# Caddy Routing Hardening

Config: `infra/caddy/Caddyfile`

Rules:
1. `/api/*` -> backend service (`backend:8000`)
2. `/health/backend` -> rewritten to backend `/api/health/`
3. `/health/frontend` -> rewritten to frontend `/healthz`
4. all other paths -> frontend (`frontend:3000`)

Result:
- API and UI coexist under one browser origin.
- Client-side route refreshes are served by frontend service instead of returning proxy-level 404s.
