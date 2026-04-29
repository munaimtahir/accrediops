# 10 — Auth Domain Truth Map

## Active topology
- Browser -> `https://phc.alshifalab.pk` (same-origin frontend).
- Host Caddy maps `phc.alshifalab.pk` and `api.phc.alshifalab.pk` to AccrediOps Caddy on `127.0.0.1:18080`.
- AccrediOps Caddy routes `/api/*` to backend and non-API routes to frontend.
- Frontend uses relative `/api/*` calls by default (`NEXT_PUBLIC_API_BASE_URL=""`), with credentials included.

## Auth endpoints handling
- `/api/auth/session/` -> Django backend
- `/api/auth/login/` -> Django backend
- `/api/auth/logout/` -> Django backend

## Cookie model
- Same-origin cookie behavior on `phc.alshifalab.pk`.
- CSRF + session cookies are `Secure` and `SameSite=Lax`.

## Source evidence
- `auth_request_headers.txt`, `auth_response_headers.txt`, `auth_session_postlogin_headers.txt`
- `production_smoke_output.txt`
- `frontend/lib/api/client.ts`, `frontend/next.config.ts`, `infra/caddy/Caddyfile`
