# Production Readiness Clarification

## Classification: LOCAL_DEV_ONLY

## Critical Findings
- **Frontend Runtime Mode:** Development (`npm run dev`).
- **NODE_ENV:** `development`.
- **Frontend Build:** Happens at container runtime (if switched to production mode, it rebuilds on start, which is a blocker for CD).
- **NPM Install:** Happens at container startup, which is a security and reliability risk for production.
- **Database:** Defaults to `SQLite`. Production should use `PostgreSQL`.
- **Debug Settings:** `DJANGO_DEBUG` is set to `False`, which is correct for production, but the server is still the Django `runserver` development server.

## Checklist

| Item | Status | Notes |
|---|---|---|
| Safe DJANGO_DEBUG | OK | Set to "False" in compose. |
| ALLOWED_HOSTS | OK | Restricted to specific domains. |
| Secret Handling | PARTIAL | Uses `.env`, but secrets should be managed by a secret store in prod. |
| Static/Media | OK | Uses Whitenoise for static files. |
| Database | RISKY | Uses SQLite by default. |
| Runtime Speed | BLOCKER | Rebuilds/Installs on every start in prod-like mode. |

## Recommendation
- Refactor `frontend/Dockerfile` to use a multi-stage build that produces a static output or a production-ready Next.js runner.
- Move `npm install` and `npm run build` to the image build phase, not the container startup phase.
- Configure a production database (e.g., PostgreSQL) in `docker-compose.prod.yml`.
- Use a production WSGI/ASGI server (e.g., Gunicorn/Uvicorn) for the backend.
