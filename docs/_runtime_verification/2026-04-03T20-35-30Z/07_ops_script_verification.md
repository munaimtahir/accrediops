# Ops script verification

## Executed scripts and outcome

- `scripts/devops/status_check.sh` -> **PASS** on updated compose target (`http://127.0.0.1:18080`).
- `scripts/devops/smoke_verify.sh` -> **PASS** on updated compose target (`http://127.0.0.1:18080`).
- `scripts/devops/logs_tail.sh` -> **Ran** (captured output earlier).
- `scripts/devops/clean_stop.sh` -> **Ran** (captured output earlier).
- `scripts/devops/rebuild_up.sh` -> **IMPLEMENTED BUT NEEDS DEBUGGING** (historically blocked by `:8080`; compose is now retargeted to `:18080`, but full stable repeatability is not yet proven across all script phases).
- `scripts/devops/reset_stack.sh` -> **IMPLEMENTED BUT NEEDS DEBUGGING** (same classification as above).
- `scripts/devops/frontend_refresh_redeploy.sh` -> **IMPLEMENTED BUT NEEDS DEBUGGING** (depends on compose frontend stability).
- `scripts/testing/run_all_checks.sh` -> **FAIL** (now executes, but fails due remaining frontend compose/dev instability and E2E assertions).

## Key diagnosis

- Scripts were updated to prefer `127.0.0.1:18080`, removing the hard `:8080` host conflict.
- Remaining instability is centered on frontend compose dev runtime (`.next` artifact churn and intermittent `/healthz` failures), which cascades into E2E and `run_all_checks.sh`.

Evidence files:

- `OUT/runtime_verification/2026-04-03T20-35-30Z/ops_script_output.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/ops_script_output_extended.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/logs_tail_output.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/status_check_postfix.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/status_check_postfix2.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/smoke_verify_postfix.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/smoke_verify_postfix2.txt`
- `OUT/runtime_verification/2026-04-03T20-35-30Z/run_all_checks_postfix6.txt`
