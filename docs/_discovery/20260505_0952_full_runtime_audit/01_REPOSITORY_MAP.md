# Repository Map

## Core Frameworks
- **Backend:** Django 5.2, Django REST Framework 3.16
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Database:** SQLite (local development context)
- **Docker:** Optimized `docker-compose.yml` (uses `npm run dev` for rapid local verification).

## Directory Structure Summary
- `backend/`: Django backend application.
- `frontend/`: Next.js React frontend.
- `docs/`: Extensive documentation including the new stabilization evidence.
- `infra/caddy/`: Reverse proxy configuration.
- `scripts/`: Devops and testing scripts.

## CI/CD Workflows
- Local verification scripts in `scripts/testing/`.
- Frontend now includes a `typecheck` script (`tsc --noEmit`).
