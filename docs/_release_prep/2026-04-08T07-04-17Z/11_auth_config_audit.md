# 11 — Auth Config Audit

## Backend
- `DJANGO_ALLOWED_HOSTS` includes PHC and OPS hosts.
- `DJANGO_CSRF_TRUSTED_ORIGINS` includes `https://phc.alshifalab.pk` and `https://api.phc.alshifalab.pk`.
- `DJANGO_DEBUG=False`.
- Cookie security:
  - `DJANGO_SESSION_COOKIE_SECURE=True`
  - `DJANGO_CSRF_COOKIE_SECURE=True`
  - `DJANGO_SESSION_COOKIE_SAMESITE=Lax`
  - `DJANGO_CSRF_COOKIE_SAMESITE=Lax`
- Proxy trust:
  - `USE_X_FORWARDED_HOST=True`
  - `SECURE_PROXY_SSL_HEADER=("HTTP_X_FORWARDED_PROTO", "https")`

## Frontend
- `NEXT_PUBLIC_API_BASE_URL=""` (relative API path mode).
- `BACKEND_API_URL=http://backend:8000` used by Next rewrite.
- API client uses `credentials: "include"` and CSRF header on mutating requests.

## Proxy/Caddy
- Host Caddy routes:
  - `phc.alshifalab.pk` -> `127.0.0.1:18080`
  - `api.phc.alshifalab.pk` -> `127.0.0.1:18080`
- AccrediOps Caddy routes `/api/*` to backend and UI to frontend.

## Evidence
- `env_audit_redacted.txt`
- `compose_audit.txt`
- `caddy_relevant_config.txt`
- `infra/caddy/Caddyfile`
