# 06 Redeploy and Smoke Evidence

> Historical snapshot before runtime-port reassignment. Current canonical local origin is `http://127.0.0.1:18080`.

## Commands run
1. `scripts/devops/clean_stop.sh`
2. `scripts/devops/rebuild_up.sh`
3. `scripts/devops/status_check.sh`
4. `scripts/devops/smoke_verify.sh`

## Result summary
- `clean_stop.sh`: completed
- `rebuild_up.sh`: completed (backend + frontend healthy; caddy container started)
- `status_check.sh`: completed with drift evidence on canonical host endpoint responses
- `smoke_verify.sh`: **FAILED**

## Key evidence

### Compose status snapshot
- backend: Up (healthy)
- frontend: Up (healthy)
- caddy: intermittently starts, but canonical host binding is blocked in this environment

### Smoke output (captured)
- PASS: `/`
- PASS: `/health/frontend`
- PASS: `/health/backend`
- PASS: `/api/health/`
- PASS: `/projects`
- FAIL: `/api/auth/session/` (404; expected 200/401/403)
- FAIL: `/api/projects/` (404; expected 200/401/403)

### Canonical host mismatch
Direct host checks show:
- `Server: nginx/1.29.5`
- HTML title: `sims_frontend`

This indicates `127.0.0.1:8080` is not resolving to this stack’s Caddy in this environment.

### Port conflict evidence
`docker compose up -d --force-recreate caddy` fails with:
- `Bind for 127.0.0.1:8080 failed: port is already allocated`

Current owner of host `127.0.0.1:8080`:
- `fmu_frontend    127.0.0.1:8080->80/tcp`
