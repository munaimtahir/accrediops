# Routing fix and verification

## Fixes applied

1. Replaced user frontend service command to run Next.js:
   - `~/.config/systemd/user/accrediops-frontend.service`
   - from `scripts/serve_frontend.py` to `npm run start -- --hostname 127.0.0.1 --port 8013`
2. Reloaded and restarted user services:
   - `systemctl --user daemon-reload`
   - `systemctl --user restart accrediops-backend.service accrediops-frontend.service`

## Post-fix verification

- `https://ops.alshifalab.pk/` returns Next.js redirect behavior (`307` to `/projects`) and Next headers.
- `https://ops.alshifalab.pk/healthz` returns frontend JSON health.
- `https://ops.alshifalab.pk/api/health/` returns backend JSON health.
- `/api/health` redirects to `/api/health/` (`301`), confirming slash normalization remains active.

Evidence files:

- `OUT/runtime_verification/2026-04-03T20-35-30Z/root_route_checks.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/live_checks.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/routing_verification.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/api_normalization_checks.txt`
