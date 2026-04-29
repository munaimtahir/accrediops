# Tech Stack and Runtime

## Architecture Pattern
Contract-first, API-first, frontend-mediated, governance-centered architecture.

## Backend Stack
- **Language:** Python 3.12+
- **Framework:** Django 5.2
- **API Layer:** Django REST Framework 3.16
- **Testing:** Pytest, Pytest-Django
- **WSGI/ASGI:** Whitenoise included for static files, likely Gunicorn or Daphne in prod.

## Frontend Stack
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS, PostCSS, Class Variance Authority, Lucide React
- **Data Fetching:** React Query (@tanstack/react-query)
- **Testing:** Vitest (Unit/Component), Playwright (E2E), React Testing Library

## Database Layer
- **Local Development:** SQLite (`django.db.backends.sqlite3` defined in docker-compose.yml)
- **Production Target:** PostgreSQL (implied by `psycopg[binary]` in `requirements.txt`)

## Infrastructure & Deployment
- **Orchestrator:** Docker & Docker Compose
- **Reverse Proxy:** Caddy v2.8
- **Ports:** 
  - Frontend: 3000 (Internal), 18080 (via Caddy)
  - Backend: 8000 (Internal)
