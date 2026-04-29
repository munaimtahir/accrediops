# 01 Port Audit

## Primary allocation truth inspected
- `/home/munaim/srv/proxy/caddy/Caddyfile`

## Master Caddy upstream allocations (initial audit snapshot)
- `3025 8010 8011 8012 8013 8014 8015 8016 8018 8025 8033 8034 8080 8081 8082 9030 9031 13000 18000`

## Active binding checks (initial audit snapshot)
- Commands:
  - `docker ps --format '{{.Names}}\t{{.Ports}}'`
  - `ss -ltnp`
  - `netstat -ltnp || true`
- Relevant active host binds observed:
  - `8080` (`fmu_frontend`)
  - `8081`, `8082`
  - `8010`, `8013`, `8014`, `8015`, `8016`
  - `18000`
  - `9030`, `9031`
  - `8501`
- `18080` was not present in the initial allocation list and not bound at selection time.

## Chosen free port
- `18080`

## Why it was selected as free
1. Not allocated for AccrediOps in master Caddy during initial audit.
2. Not bound by any running container/process during initial audit.
3. In high non-colliding range and adjacent to existing stack conventions without colliding.

## Post-lock confirmation
- `accrediops-caddy` now publishes `0.0.0.0:18080->8080/tcp`.
- `ss -ltnp` shows active listeners on `:18080` for this stack.
