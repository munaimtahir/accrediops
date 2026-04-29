# 02 Runtime Truth Alignment

> Historical snapshot before runtime-port reassignment. Current canonical local origin is `http://127.0.0.1:18080`.

## Locked runtime target
- Browser entrypoint: `http://localhost:8080/`
- Proxy model: Caddy on `8080`, forwarding `/api/*` to backend and app routes to frontend.

## Alignment changes made
- `docker-compose.yml`: caddy host mapping set to `8080:8080`.
- `scripts/devops/status_check.sh`: default base URL set to `http://127.0.0.1:8080`.
- `scripts/devops/smoke_verify.sh`: default base URL set to `http://127.0.0.1:8080`.
- `scripts/testing/run_all_checks.sh`: Playwright base default moved to `8080`.
- `frontend/playwright.config.ts` and `frontend/tests/e2e/global-setup.cjs`: base URL default moved to `8080`.
- `contracts/openapi/openapi.yaml`: server URL aligned to `http://localhost:8080`.

## Verification result
**Status:** FAIL (environmental host-port conflict blocks canonical runtime validation)

Evidence:
- `docker compose up -d --force-recreate caddy` fails with:
  - `Bind for 127.0.0.1:8080 failed: port is already allocated`
- Host port 8080 is currently owned by another container:
  - `fmu_frontend    127.0.0.1:8080->80/tcp`
- Requests to `http://127.0.0.1:8080/*` are served by `nginx` with unrelated Vite HTML (`sims_frontend`), not this stack's Caddy.

## Impact
- Canonical same-origin runtime validation at `localhost:8080` is currently blocked in this shared host environment.
- Backend and frontend containers remain healthy, but Caddy cannot bind canonical host port `8080` here.
