# Dev Redeploy Guide

## Scripts
- `scripts/devops/clean_stop.sh`: stop stack safely, keep volumes.
- `scripts/devops/rebuild_up.sh`: rebuild and start all services.
- `scripts/devops/reset_stack.sh`: reset containers and rebuild; set `REMOVE_IMAGES=true` to clear app images.
- `scripts/devops/frontend_refresh_redeploy.sh`: fast rebuild/restart for frontend/backend UI updates.
- `scripts/devops/logs_tail.sh`: tail frontend/backend/caddy logs.
- `scripts/devops/status_check.sh`: print compose status and health endpoint checks.
- `scripts/devops/smoke_verify.sh`: pass/fail smoke checks.
- `scripts/devops/hard_reset_with_warning.sh`: destructive reset, guarded by explicit confirmation phrase.

## Safe vs destructive
- Safe defaults: `clean_stop.sh`, `rebuild_up.sh`, `status_check.sh`, `smoke_verify.sh`.
- Potentially destructive: `reset_stack.sh` with `REMOVE_IMAGES=true`.
- Fully destructive: `hard_reset_with_warning.sh` (removes volumes after explicit typed confirmation).

## Verify changes took effect
1. `scripts/devops/rebuild_up.sh`
2. `scripts/devops/status_check.sh`
3. `scripts/devops/smoke_verify.sh`
4. Open `/projects` and target changed route in browser.

Canonical browser origin: `http://127.0.0.1:18080`.
