# Current State Review

## Playwright Command
The existing command used is `npx playwright test tests/e2e/17_recurring_and_masters_capability_fix.spec.ts --reporter=list`. The global setup uses `tests/e2e/global-setup.cjs`.

## Current Failure Mode
The tests are consistently timing out during the `beforeEach` hook while waiting for the element `input[name="username"]` at `page.fill`. The error is:
`Error: page.fill: Test timeout of 60000ms exceeded.`

## Suspected Cause
The application is either not reachable at the `baseURL` (`http://127.0.0.1:18080`), or the Docker container stack has not fully spun up/stabilized before the tests execute. Given the long `start_period` for the `frontend` container (90s) in the `docker-compose.yml`, if tests are run before `caddy` is fully ready, it fails. Alternatively, local dev servers were used previously but mismatched the Playwright `baseURL` which defaults to `http://127.0.0.1:18080`.

## Ports and Services
- **Backend:** Port `8000` (internal Docker network)
- **Frontend:** Port `3000` (internal Docker network)
- **Caddy:** Port `18080` (mapped to host `127.0.0.1:18080`, proxying to frontend and backend)
- **Docker service names:** `accrediops-backend`, `accrediops-frontend`, `accrediops-caddy`

## Auth/Session Setup
Tests are manually performing login in `beforeEach` via `/login`.

## Recurring Queue Workflow Status
The recurring queue row-level capabilities (`can_submit`, `can_approve`) are added to the backend serializer and consumed by the frontend for the Submit action.
The **Approve UI is missing**.

## Missing Approve UI Location
The missing Approve action should be placed alongside the Submit action in the recurring queue tables in `frontend/components/screens/project-recurring-screen.tsx`.
