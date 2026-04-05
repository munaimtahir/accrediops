# Health Endpoints

- Backend direct: `/api/health/`
- Frontend direct: `/healthz`
- Proxy backend check: `/health/backend`
- Proxy frontend check: `/health/frontend`

Expected response shape:
```json
{"success": true, "data": {"status": "ok", ...}}
```
for backend API envelope routes, and standard JSON for frontend health route.
