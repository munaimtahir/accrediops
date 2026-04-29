# Startup Sequence

1. `docker compose build`
2. `docker compose up -d`
3. Backend applies migrations and starts server.
4. Frontend starts Next runtime.
5. Caddy starts and routes `/api/*` + UI routes.
6. Run:
   - `scripts/devops/status_check.sh`
   - `scripts/devops/smoke_verify.sh`
7. Verify browser routes on `http://127.0.0.1:18080`.
