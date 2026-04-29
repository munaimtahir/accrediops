# 29 — Post-Release Watchlist

## Watch items
1. **Django deploy warnings**
   - `security.W004` (`SECURE_HSTS_SECONDS`)
   - `security.W008` (`SECURE_SSL_REDIRECT`)
   - Current state: handled at proxy edge; track for policy unification.

2. **E2E reseed behavior**
   - `frontend/tests/e2e/global-setup.cjs` reseeds data.
   - Enforce “no e2e against production DB” and/or mandatory cleanup automation.

3. **Shared reverse-proxy host drift**
   - Multiple products share host Caddy.
   - Keep PHC route assertions in routine ops checks.

4. **Data cleanliness guardrail**
   - Periodic checks on project/evidence/export table growth for non-production patterns.
