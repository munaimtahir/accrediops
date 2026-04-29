# Deployment Path Map

## AccrediOps deployment path (verified)
1. **Repo path**: `/home/munaim/srv/apps/accrediops`
2. **Compose file**: `docker-compose.yml`
3. **Services**:
   - `accrediops-backend`
   - `accrediops-frontend`
   - `accrediops-caddy`
4. **Frontend runtime**:
   - Next.js production server in container
   - internal port `3000`
5. **Proxy**:
   - Caddy listens on host `:18080`
   - proxies all non-API traffic to `frontend:3000`
6. **Backend proxy path**:
   - `/api/*` -> `backend:8000`
7. **Build/redeploy scripts used**:
   - `scripts/devops/rebuild_up.sh`
   - `scripts/devops/frontend_refresh_redeploy.sh`
   - status/smoke checks:
     - `scripts/devops/status_check.sh`
     - `scripts/devops/smoke_verify.sh`

## Important topology caveat on host
Other apps run concurrently with overlapping-looking frontend ports:
- `fmu_frontend` on `127.0.0.1:8080`
- `pgsims_frontend` on `127.0.0.1:8082`
- AccrediOps is on `127.0.0.1:18080` through Caddy.

This created deployment truth confusion when checking the "live site" without strict base URL targeting.

