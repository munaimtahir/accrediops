# 12 — Auth Fix Report

## Root cause category
- **MISSING_ALLOWED_HOST + MISSING_CSRF_TRUSTED_ORIGIN + domain/runtime drift**

## Fixes applied
- Added PHC hostnames/origins to runtime configuration.
- Hardened cookie security and same-site settings for HTTPS production behavior.
- Kept same-origin API model through frontend relative `/api` calls and Caddy rewrites.
- Rebuilt/restarted runtime and revalidated live auth flow.

## Live verification result
- Login/session/logout flow works on `https://phc.alshifalab.pk`.
- No 400 responses in final live smoke for `/api/auth/login` and `/api/auth/session`.
- Session established and then invalidated correctly on logout.

## Evidence
- `production_smoke_output.txt`
- `auth_response_headers.txt`
- `auth_session_postlogin_body.json`
- `auth_logout_body.json`
