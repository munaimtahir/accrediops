# Live stack verification

## Verified responses

- `/` -> `307` to `/projects` from Next.js frontend
- `/healthz` -> `200` frontend JSON health
- `/api/health/` -> `200` backend JSON health
- `/static/admin/css/base.css` -> `200`
- `/admin/login/` -> `200` with CSS/JS links present

## Routing behavior checks

- `/api/health` -> `301` to `/api/health/`
- `/api//health/` -> `404` (duplicate slash path is not normalized)
- `/projects/` -> `308` to `/projects`

## Proxy/runtime notes

- Live domain uses host Caddy + host user systemd services.
- Repo docker-compose stack is not the active live traffic path for `ops.alshifalab.pk`.

Evidence files:

- `OUT/runtime_verification/2026-04-03T20-35-30Z/live_checks.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/root_route_checks.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/api_normalization_checks.txt`
