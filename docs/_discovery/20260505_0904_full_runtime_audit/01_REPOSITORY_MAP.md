# Repository Map

## Core Frameworks
- **Backend:** Django 5.2, Django REST Framework 3.16
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Database:** SQLite (local development context, psycopg also in requirements)
- **Docker:** `docker-compose.yml` configures the backend, frontend, and Caddy proxy.
- **API Spec:** `contracts/openapi/openapi.yaml`

## Directory Structure Summary
- `backend/`: Django backend application.
  - `apps/`: Business logic divided into modules (accounts, ai_actions, audit, evidence, exports, frameworks, indicators, masters, projects, recurring, workflow).
  - `config/`: Main Django settings and routing.
- `frontend/`: Next.js React frontend.
  - `app/`: Next.js App Router structure.
  - `components/`: UI and business components.
  - `lib/`: API client, authz, hooks, and helpers.
  - `tests/`: Frontend tests using Vitest.
  - `tests/e2e/`: Playwright end-to-end tests.
- `contracts/`: Holds the OpenAPI definition.
- `docs/`: Extensive project documentation, implementation logs, and verification reports.
- `infra/caddy/`: Reverse proxy configuration for routing.
- `scripts/`: Devops, testing, and helper scripts for deployment and verification.
- `tests/`: E2E tests workspace mapping.

## CI/CD Workflows
- The project primarily relies on local Bash scripts in `scripts/devops/` and `scripts/testing/`. No GitHub Actions or GitLab CI folders were detected in the initial scan.
