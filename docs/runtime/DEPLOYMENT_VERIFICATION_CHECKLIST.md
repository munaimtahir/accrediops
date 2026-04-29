# Deployment Verification Checklist

Canonical origin for this stack: `http://127.0.0.1:18080` (or `http://localhost:18080`).

1. `docker compose ps` shows `backend`, `frontend`, `caddy` up and healthy.
2. `GET /health/frontend` returns JSON with `status=ok`.
3. `GET /health/backend` returns JSON with `status=ok`.
4. `GET /api/health/` succeeds from browser/proxy path.
5. `GET /projects` route loads from browser without direct backend URL dependency.
6. `GET /admin` route loads.
7. `GET /api/auth/session/` resolves (200/401/403 depending auth mode).
8. `GET /api/projects/` resolves (200/401/403 depending auth mode).
9. Refreshing a deep frontend route (e.g. `/projects/1/worklist`) does not return 404.
10. Run `scripts/devops/smoke_verify.sh` and confirm success summary.
