# 04 Master Caddy Alignment

## File changed
- `/home/munaim/srv/proxy/caddy/Caddyfile`

## What changed
- Removed legacy AccrediOps OPS-domain routes:
  - `ops.alshifalab.pk { ... }`
  - `api.ops.alshifalab.pk { ... }`
- Added explicit AccrediOps local runtime allocation note:
  - `# Canonical local compose runtime allocation: http://127.0.0.1:18080`

## Safety scope
- Only AccrediOps legacy OPS-domain section was touched.
- Other application routing blocks were not edited.

## Host Caddy apply commands
- `caddy validate --config /home/munaim/srv/proxy/caddy/Caddyfile`
- `caddy reload --config /home/munaim/srv/proxy/caddy/Caddyfile`

Both commands succeeded.

## App-local Caddy consistency
- `infra/caddy/Caddyfile` remains container-local `:8080`.
- Host publish is now `18080:8080` from `docker-compose.yml`.
