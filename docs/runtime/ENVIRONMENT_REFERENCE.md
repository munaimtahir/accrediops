# Environment Reference

## Backend required
- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `DB_ENGINE`
- `DB_NAME`

## Backend optional
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

## Frontend required (runtime wiring)
- `BACKEND_API_URL` (recommended in server-side runtime)

## Frontend optional
- `NEXT_PUBLIC_API_BASE_URL` (for explicit public API host usage)

## Defaults
- Local compose defaults route browser traffic through `http://localhost:18080`.
- Frontend API requests use `/api/*` and are rewritten/proxied.

## Production-sensitive notes
- Do not expose raw backend port publicly if proxying via Caddy.
- Keep `DJANGO_ALLOWED_HOSTS` and CSRF trusted origins aligned to deployed domains.
- Avoid hardcoded localhost API URLs in production builds.
