# 03 Files Updated

## Runtime/config/test alignment
- `docker-compose.yml` — switched host publish to `18080:8080`; removed legacy `ops.alshifalab.pk` host/csrf entries.
- `infra/caddy/Caddyfile` — kept container listener `:8080` with explicit host mapping note to `18080`.
- `contracts/openapi/openapi.yaml` — local proxy server URL moved to `http://127.0.0.1:18080`.
- `backend/config/accrediops_backend/settings.py` — default CSRF trusted origins moved off legacy OPS domain to local canonical `18080`.
- `backend/.env.example` — removed legacy OPS domains and aligned local CSRF defaults to `18080`.
- `frontend/site/index.html` — removed legacy OPS domain/ports references (`8013/18000`) and aligned to current runtime (`18080`, internal `3000/8000`).

## Runtime/docs alignment
- `docs/runtime/DEV_REDEPLOY_GUIDE.md`
- `docs/runtime/CADDY_ROUTING.md`
- `docs/runtime/DEPLOYMENT_VERIFICATION_CHECKLIST.md`
- `docs/runtime/ENVIRONMENT_REFERENCE.md`
- `docs/runtime/STARTUP_SEQUENCE.md`
- `docs/runtime/ROUTES_AND_PORTS.md`
- `docs/runtime/TRUTH_MAP.md`
- `docs/runtime/HEALTH_ENDPOINTS.md`

Reason: all active runtime docs now reference `18080` as canonical local browser origin.

## Testing docs alignment
- `docs/testing/SMOKE_TESTS.md`

Reason: smoke command examples now target `18080`.

## Historical parity docs touched
- `docs/_parity_fix/20260410_2059/01_gap_fixes.md`
- `docs/_parity_fix/20260410_2059/02_runtime_truth_alignment.md`
- `docs/_parity_fix/20260410_2059/03_authz_truth_map.md`
- `docs/_parity_fix/20260410_2059/04_import_validation_contract_fix.md`
- `docs/_parity_fix/20260410_2059/05_role_visibility_matrix.md`
- `docs/_parity_fix/20260410_2059/06_redeploy_and_smoke_evidence.md`
- `docs/_parity_fix/20260410_2059/07_test_evidence.md`
- `docs/_parity_fix/20260410_2059/08_final_verdict.md`

Reason: annotated as historical snapshots pre-port-reassignment.

## Server allocation truth
- `/home/munaim/srv/proxy/caddy/Caddyfile` (outside repo)

Reason: retired legacy `ops.alshifalab.pk` and `api.ops.alshifalab.pk` blocks; added canonical local AccrediOps allocation note (`18080`).
