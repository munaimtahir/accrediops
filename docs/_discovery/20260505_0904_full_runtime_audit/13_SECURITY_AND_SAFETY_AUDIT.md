# Security and Safety Audit

## Secrets and Environments
- `.env.example` and `.env7` (obscured) are present.
- `docker-compose.yml` does not hardcode sensitive secrets.
- `DJANGO_DEBUG` defaults to `False` in the Docker setup, which is correct.

## Infrastructure Security
- **Allowed Hosts:** `DJANGO_ALLOWED_HOSTS` in `docker-compose.yml` is restricted to local domains, `caddy`, `frontend`, `backend`, and the production domains `phc.alshifalab.pk`.
- **CSRF / CORS:** Properly configured (`DJANGO_CSRF_TRUSTED_ORIGINS`, `DJANGO_SESSION_COOKIE_SECURE=True`).
- **Proxy:** Caddy acts as a secure entry point handling HTTPS and reverse proxying natively.

## AI Guardrails
- **Trust Boundary:** The backend model explicitly flags `is_advisory` on `DocumentDraft`. AI cannot directly modify evidence or governance state without user promotion. Prompt context snapshots are logged via `AIUsageLog`.

## Application Risks
- **Unsafe Commands:** The `scripts/devops/` folder contains commands like `hard_reset_with_warning.sh`. These must never be executed in a production environment.
- **Docker Production Gap:** The frontend Dockerfile/command dynamically installs dev dependencies and rebuilds the source inside the container. This is a severe production vulnerability, as it allows arbitrary code execution during runtime startup via compromised NPM packages.
