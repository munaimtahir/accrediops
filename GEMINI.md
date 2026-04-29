# GEMINI.md

## Project Overview

**AccrediOps** is an internal accreditation operations platform designed for service-delivery teams to manage, monitor, and finalize accreditation work for clients. It is built as a contract-first, API-first application with a strict governance-centered architecture.

### Core Technologies
- **Backend:** Django 5.2, Django REST Framework 3.16
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Infrastructure:** Docker Compose, Caddy (Reverse Proxy)
- **Database:** SQLite (local development)
- **API Specification:** OpenAPI (located in `contracts/openapi/`)

---

## Building and Running

### Using Docker (Recommended)
The entire stack can be launched using Docker Compose:
```bash
docker-compose up --build
```
- **Frontend:** http://localhost:18080
- **Backend API:** http://localhost:18080/api/
- **Caddy Proxy:** Runs on port 18080

### Local Development

#### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at http://localhost:3000.

---

## Testing

### Backend
Uses `pytest` with `pytest-django` and `pytest-cov`.
```bash
cd backend
pytest
```

### Frontend
- **Unit/Integration Tests:** `npm run test` (Vitest)
- **End-to-End Tests:** `npm run test:e2e` (Playwright)
- **Coverage:** `npm run test:coverage`

---

## Development Conventions

### 1. Contract-First API Development
The OpenAPI specification in `contracts/openapi/openapi.yaml` is the source of truth for the API. Finalize the contract before implementing backend logic or frontend components.

### 2. Architecture Doctrine
- **Frontend-Mediated:** Users must only interact with the system via the frontend UI.
- **Database as Source of Truth:** All governance data resides in the database. Exports and AI outputs are secondary.
- **Internal Service Layer:** Keep business logic in internal service layers, exposed via DRF views.

### 3. AI Usage (Advisory Only)
AI features are intended for guidance, drafting, and classification support. AI must **never** directly mutate governance state or bypass manual human review for accreditation decisions.

### 4. Code Style & Standards
- Follow standard Django/DRF patterns for the backend.
- Use TypeScript for all frontend development.
- Adhere to the established directory structure (see `docs/11_Directory_Structure.md`).

---

## Key Directories
- `backend/`: Django application source code.
- `frontend/`: Next.js application source code.
- `contracts/openapi/`: API definitions.
- `docs/`: Extensive project documentation and architecture details.
- `infra/caddy/`: Caddy configuration for local and production routing.
