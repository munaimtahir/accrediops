# Repository Inventory

## Root Files
- `README.md`: Starter pack instructions and product vision.
- `docker-compose.yml`: Local orchestrator for backend, frontend, and caddy.
- `GEMINI.md`: Contextual rules for Gemini AI agents.
- `ADMIN_ACCESS_NOTE.md`, `AUTH_ROUTE_MATRIX.md`, `FIX_SUMMARY.md`, etc.: Context documents.

## Application Structure
This is a **Hybrid Project** (Django backend + Next.js frontend).

### Backend (`/backend`)
- **Framework**: Django 5.2, Django REST Framework.
- **Apps**: `accounts`, `ai_actions`, `api`, `audit`, `evidence`, `exports`, `frameworks`, `indicators`, `masters`, `projects`, `recurring`, `workflow`.
- **Key Files**: `manage.py`, `requirements.txt`, `pytest.ini`.

### Frontend (`/frontend`)
- **Framework**: Next.js 15, React 19.
- **Styling**: Tailwind CSS.
- **Key Folders**: `app/` (Next.js App Router), `components/` (React components), `lib/` (API clients/hooks), `tests/` (Vitest/Playwright).
- **Key Files**: `package.json`, `tailwind.config.ts`, `playwright.config.ts`.

### Infrastructure (`/infra`)
- **Caddy**: Reverse proxy config `infra/caddy/Caddyfile`.

### Documentation (`/docs`)
- Comprehensive architecture docs (`05_Architecture_Doctrine.md`), AI guardrails, and historical discovery/implementation records.

### Contracts (`/contracts`)
- **OpenAPI**: `contracts/openapi/openapi.yaml` (API-first contract).
