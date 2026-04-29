# Deployment Readiness

## A. Deployment Inventory

| Component | Exists? | File/Path | Status | Gap |
|---|---|---|---|---|
| Dockerfile (Backend) | Yes | `backend/Dockerfile` | COMPLETE | None |
| Dockerfile (Frontend) | Yes | `frontend/Dockerfile` | COMPLETE | None |
| Docker Compose | Yes | `docker-compose.yml` | COMPLETE | Needs production variant |
| Caddyfile | Yes | `infra/caddy/Caddyfile` | COMPLETE | Needs prod domain config |
| Environment Variables | Yes | `backend/.env.example` | COMPLETE | Production keys needed |
| Healthcheck | Yes | In compose file & `/api/health/` | COMPLETE | None |
| Migration Command | Yes | In compose command string | COMPLETE | Ensure safety for prod updates |
| Static Build | Yes | `npm run build` / Whitenoise | COMPLETE | None |

## B. VPS Readiness Checklist

| Item | Status | Required Fix |
|---|---|---|
| Database Configuration | PARTIAL | Need managed Postgres or volume-bound Postgres in prod. |
| SSL/TLS setup | PARTIAL | Caddy handles this automatically if domains are configured correctly. |
| allowed_hosts / CORS | PARTIAL | Ensure final production domains (apk.alshifalab.pk) are in env vars. |
| Backup Strategy | MISSING | No pg_dump cron / script set up. |
| Static Storage | PARTIAL | Whitenoise is fine, but uploaded Evidence needs S3/blob config. |

## C. Caddy/DNS Notes

Current proxy relies on port 18080. For production, Caddyfile needs to map the exact subdomain (e.g., `apk.alshifalab.pk`) to port 80/443 directly.
