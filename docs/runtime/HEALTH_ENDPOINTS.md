# Health Endpoints

- Backend direct: `/api/health/`
- Frontend direct: `/healthz`
- Proxy backend check: `/health/backend`
- Proxy frontend check: `/health/frontend`
- Canonical proxy base URL: `http://127.0.0.1:18080`

Expected response shape:
```json
{"success": true, "data": {"status": "ok", ...}}
```
for backend API envelope routes, and standard JSON for frontend health route.
