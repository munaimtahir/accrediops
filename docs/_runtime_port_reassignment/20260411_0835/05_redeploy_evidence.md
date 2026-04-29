# 05 Redeploy Evidence

## Safe redeploy path run
1. `scripts/devops/clean_stop.sh`
2. `scripts/devops/rebuild_up.sh`
3. `scripts/devops/status_check.sh`
4. `scripts/devops/smoke_verify.sh`

## Output summary
- Clean stop: success.
- Rebuild up: success; backend/frontend healthy; caddy published `0.0.0.0:18080->8080/tcp`.
- First immediate status/smoke invocation after startup showed transient early-read failures (`Empty reply from server` / status `000`) while services were just settling.
- Re-run of status and smoke after stack stabilized: success.

## Post-cleanup rerun (after removing legacy OPS references)
- Full safe path re-executed with same commands.
- `status_check.sh`: success.
- `smoke_verify.sh`: success.

## Host proxy apply
- `caddy validate --config /home/munaim/srv/proxy/caddy/Caddyfile` → success.
- `caddy reload --config /home/munaim/srv/proxy/caddy/Caddyfile` → success.
