# Homepage placeholder root cause

## Findings

1. Host Caddy (system service) routed `ops.alshifalab.pk` root traffic to `127.0.0.1:8013`.
2. Port `8013` was managed by user service `accrediops-frontend.service`.
3. That service ran:
   - `/usr/bin/python3 .../scripts/serve_frontend.py --host 127.0.0.1 --port 8013`
4. `serve_frontend.py` serves the lightweight static shell from `frontend/site/index.html`.
5. Therefore live `/` showed placeholder content, not the Next.js app.

## Confirming evidence

- `OUT/runtime_verification/2026-04-03T20-35-30Z/host_caddy_config.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/process_and_ports.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/pre_fix_direct_checks.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/root_route_checks.txt`
