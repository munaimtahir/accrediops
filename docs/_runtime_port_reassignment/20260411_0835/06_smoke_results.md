# 06 Smoke Results

Base URL: `http://127.0.0.1:18080`

| Route | Result | Evidence |
|---|---|---|
| `GET /` | PASS | `307` redirect to `/projects`; `Server: Caddy`; HTML title includes `AccrediOps` |
| `GET /health/frontend` | PASS | `200`, JSON `{"status":"ok","service":"accrediops-frontend"}` |
| `GET /health/backend` | PASS | `200`, backend envelope with `status: ok` |
| `GET /api/health/` | PASS | `200`, backend envelope with `status: ok` |
| `GET /projects` | PASS | `307` auth-aware redirect to `/login?next=%2Fprojects` |
| `GET /admin` | PASS | `307` auth-aware redirect to `/login?next=%2Fadmin` |
| `GET /api/auth/session/` | PASS | `200`, unauthenticated session payload |
| `GET /api/projects/` | PASS | `403`, expected auth-aware protected response |
| `GET /projects/1/worklist` | PASS | `307` auth-aware redirect, no proxy 404 |

## Not served by unrelated app
- `:18080` responses show `Server: Caddy` and AccrediOps Next.js payload/title.
- `:8080` sanity check still returns unrelated app (`Server: nginx/1.29.5`), confirming separation.
