# Playwright run summary (2026-05-07)

## Command
- Run location: `/home/munaim/srv/apps/accrediops/frontend`
- Command: `npx playwright test`
- Config: `frontend/playwright.config.ts`
- Base URL (config default): `http://127.0.0.1:18080`

## Outcome
- Status: **FAILED (global setup)**
- Tests executed: **0** (no suites discovered/executed due to `globalSetup` error)
- Primary error: `net::ERR_CONNECTION_REFUSED` navigating to `/login`
- Error location: `frontend/tests/e2e/global-setup.cjs:60`

## Classification table

| Item | Classification | Evidence | Likely cause | Next action |
|---|---|---|---|---|
| Entire run | Env/Infra setup failure (pre-test) | `page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:18080/login` in `globalSetup` | App under test not running / not reachable at `PLAYWRIGHT_BASE_URL` (default `127.0.0.1:18080`) | Start the app/service at `127.0.0.1:18080` or set `PLAYWRIGHT_BASE_URL` to the correct running URL, then re-run Playwright |
| Failing tests list | Not applicable | `suites: []` and `errors: [...]` in results JSON | Global setup aborted before tests could run | Re-run after fixing base URL/server availability |
| Traces/screenshots/videos | Not applicable | No files beyond `OUT/playwright/results.json` + `playwright-report/index.html` | Artifacts are only retained “on failure” of test executions; none ran | After server is up, failing tests will produce artifacts under `OUT/playwright/` |

## Pointers
- Raw console output: `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/playwright_test_output.txt`
- Results JSON: `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/OUT_playwright_results.json`
- HTML report snapshot: `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/playwright-report_index.html`
