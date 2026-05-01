# Test Server Setup Status

## 1. Backend Local/Test Server
- **Expected Purpose:** Serve the Django REST Framework API.
- **Start Command:** `python manage.py runserver 8000` (or via Docker Compose)
- **Required Environment Variables:** `DB_NAME`, `DB_ENGINE`, `DJANGO_SETTINGS_MODULE`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` (found in `.env.example`).
- **Health Check Method:** `http://127.0.0.1:8000/api/health/` (configured in docker-compose.yml).
- **Verified Status:** Healthy. The Docker Compose backend container started successfully and reached a healthy state.
- **Logs Location:** `docker logs accrediops-backend`
- **Failure Reason if failed:** N/A

## 2. Frontend Local/Test Server
- **Expected Purpose:** Serve the Next.js React application.
- **Start Command:** `npm run dev` (local) or `npm run start` (Docker Compose).
- **Required Environment Variables:** `BACKEND_API_URL`, `NEXT_PUBLIC_API_BASE_URL`.
- **Health Check Method:** `http://127.0.0.1:3000/healthz` (configured in docker-compose.yml).
- **Verified Status:** Failed to start.
- **Logs Location:** `docker logs accrediops-frontend`
- **Failure Reason if failed:** Container exited with code 1 after failing to build or start. The frontend has typescript compilation errors that affect the `npm run build` command, which is executed inside the Docker container startup script.

## 3. Test Database
- **Expected Purpose:** Store relational data.
- **Start Command:** Automatically managed via SQLite for development.
- **Verified Status:** Working. SQLite file `db.sqlite3` is created and migrations run successfully on backend startup.

## 4. Redis/Worker
- **Verified Status:** Not applicable. No Redis or Celery worker is defined in the `docker-compose.yml`.

## 5. Docker Compose Full Stack
- **Expected Purpose:** Run the entire application (Frontend, Backend, Caddy).
- **Start Command:** `docker compose up -d --build`
- **Verified Status:** Partially healthy. Backend starts, but Frontend fails, preventing Caddy from becoming healthy.

## 6. Playwright Browser Environment
- **Expected Purpose:** E2E Testing.
- **Verified Status:** Not attempted yet due to frontend build failure.

## 7. AI Provider Mock/Demo Mode
- **Verified Status:** Not yet verified if mock mode is configured in `.env.example`.

## 8. Health Check Endpoints
- **Backend:** `/api/health/` (Working)
- **Frontend:** `/healthz` (Failing)

## 9. Seed/Test Data Setup
- **Verified Status:** `python manage.py migrate` runs on startup. No explicit seed command found in docker-compose yet.

## 10. Reset/Clean Environment Commands
- **Verified Status:** Standard docker compose commands (`docker compose down -v`) can be used.

**Conclusion:** The runtime setup is partially functioning. The backend starts cleanly, but the frontend fails due to typescript errors, which blocks the full stack from being usable for E2E testing.