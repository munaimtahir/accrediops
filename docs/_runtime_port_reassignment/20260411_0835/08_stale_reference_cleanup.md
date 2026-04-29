# 08 Stale Reference Cleanup

## Commands used
- `grep -R "8080" .`
- `grep -R "localhost:8080" .`
- `grep -R "127.0.0.1:8080" .`

Plus narrowed scans on active runtime surfaces to separate intentional historical references.

## Before (pre-reassignment) findings
- Active runtime files referenced `localhost:8080` / `127.0.0.1:8080` in:
  - compose publish and CSRF entries
  - devops scripts
  - OpenAPI local server
  - Playwright base/default URLs
  - runtime/testing docs

## After (active runtime surfaces)
- No active runtime/config/test references remain to:
  - `localhost:8080`
  - `127.0.0.1:8080`
- Active runtime surfaces now point to `18080`.

## Important grep interpretation note
- Plain `grep -R "8080"` also matches `18080` substrings (expected).
- Remaining active `8080` text is intentional internal container wiring:
  - `infra/caddy/Caddyfile` listens on container `:8080`
  - `docker-compose.yml` publishes `18080:8080`

## Legacy OPS-domain cleanup
- Active AccrediOps surfaces: no matches for:
  - `ops.alshifalab.pk`
  - `api.ops.alshifalab.pk`
- Master Caddy: legacy OPS-domain blocks removed and host Caddy reloaded.

## Intentionally retained historical references
- Dated historical evidence files (for traceability), including:
  - `docs/_parity_fix/20260410_2059/*` (pre-reassignment snapshot)
  - older runtime verification artifacts and `OUT/` captures
