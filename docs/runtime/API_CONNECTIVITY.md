# API Connectivity

## Browser path
- UI calls `/api/...` only.
- Same-origin path avoids CORS drift in standard deployment.

## Frontend runtime rewrite
- `frontend/next.config.ts` rewrites `/api/:path*` to backend target.
- Source env resolution:
  1. `BACKEND_API_URL`
  2. `NEXT_PUBLIC_API_BASE_URL`
  3. fallback `http://127.0.0.1:8000`

## Hardening applied
- Trailing slash normalization
- Duplicate `/api` suffix cleanup
- Prevents accidental `.../api/api/...` path bugs
