# Live Surface Observation

## Initial live observation (before fix)
- `http://127.0.0.1:18080` initially unreachable because accrediops stack was not running.
- Runtime on same host had other projects active (`fmu_frontend` on `:8080`, `pgsims_frontend` on `:8082`), creating ambiguous "what is live" context.
- After starting accrediops stack, login succeeded, but `/projects` produced:
  - Browser runtime error page: **"Application error: a client-side exception has occurred..."**
  - No project cards / no project heading rendered.
- Captured in:
  - `OUT/deployment_truth/2026-04-07T19-10-17Z/live_feature_debug.json`
  - `OUT/deployment_truth/2026-04-07T19-10-17Z/live_projects_error_capture.png`
  - `OUT/deployment_truth/2026-04-07T19-10-17Z/live_browser_errors.json`

## Live observation after runtime fix + redeploy
- `/projects` renders correctly:
  - `Project register` present
  - `Open project` links present
  - `Power view` hidden by default with `Show power table` toggle
- `/projects/[projectId]` workspace shows:
  - `Next step guidance`
  - `Areas`, `Standards`, `Indicators` headings
- Indicator click opens drawer:
  - `Indicator workbench` title present
  - Summary/Evidence/Recurring/Comments / Notes/Review / Governance/Actions tabs present
- Captured in:
  - `OUT/deployment_truth/2026-04-07T19-10-17Z/live_feature_check_after_fix.json`
  - `OUT/deployment_truth/2026-04-07T19-10-17Z/live_projects_after_fix.png`
  - `OUT/deployment_truth/2026-04-07T19-10-17Z/live_project_workspace_after_fix.png`
  - `OUT/deployment_truth/2026-04-07T19-10-17Z/live_indicator_drawer_after_fix.png`

