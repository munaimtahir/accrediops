# Runtime truth inventory

- **Service intended to serve `/`:** Frontend runtime (Next.js app) behind host Caddy.
- **Service that was serving `/` at start:** `scripts/serve_frontend.py` placeholder shell on `127.0.0.1:8013` (via host `/etc/caddy/Caddyfile`).
- **Service intended to serve `/api/*`:** Django backend on `127.0.0.1:18000` behind host Caddy.
- **Static strategy intended:** Django static collected to backend static root and served by backend process (proxied by Caddy on `/static/*`).
- **Expected ports (host wiring):** frontend `8013`, backend `18000`, host Caddy `443/80`.
- **Expected health endpoints:** `/healthz` (frontend), `/api/health/` (backend).
- **Expected container names (repo compose):** `accrediops-backend`, `accrediops-frontend`, `accrediops-caddy` (not the active live path for the domain).
- **Likely cause of placeholder homepage:** host user service `accrediops-frontend.service` executed `scripts/serve_frontend.py` instead of Next.js server.
- **Likely cause of broken admin graphics:** missing production static config (`STATIC_ROOT`) and no collected/served static files at runtime.
