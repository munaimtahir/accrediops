# Fix Summary

## Frontend changes
- Added **Next middleware** (`frontend/middleware.ts`) as canonical auth gate for protected routes:
  - `/projects`
  - `/project-indicators/*`
  - `/frameworks/*`
  - `/admin/*`
- Preserved `next` destination on redirect to `/login`.
- Added centralized 401 handling in API client:
  - dispatches auth-required event
  - clears cached protected query data
  - redirects to login via provider bridge
- Updated API client fetch behavior to `cache: "no-store"` to prevent stale auth/API reads.
- Reworked framework import screen to project-linked flow:
  - removed manual framework-name/CSV-text import entry
  - added project dropdown from `/api/projects/`
  - file-based validation/import only
  - import button gated by successful validation
  - structured validation preview and error display.

## Backend changes
- Import contract updated to require:
  - `project_id`
  - uploaded CSV `file`
- Validation endpoint now returns structured validation payload (including missing headers / row-level errors) and import logging.
- Import endpoint now:
  - enforces project existence (404)
  - enforces initialized-project conflict (409)
  - parses/validates CSV before import
  - imports in transaction
  - links imported framework to selected project
  - initializes project indicators from imported framework
  - returns project linkage and creation counts.
- Added explicit `ConflictError` API exception (409).
- Improved global exception envelope mapping and status-specific error codes/messages (`UNAUTHORIZED`, `CONFLICT`, etc.).

## Proxy/routing/config changes
- Added Caddy alias route:
  - `/admin/` → `308` redirect to `/django-admin/`
- Kept `/admin/*` workbench routes intact for frontend admin workspace.
- Kept Django admin primary route at `/django-admin/` with static/admin assets proxying.

## Test changes
- Backend regression tests updated/expanded for:
  - project-based import validate/create flow
  - invalid project (404)
  - initialized project conflict (409)
  - invalid headers handling without generic 500
- Frontend tests updated for import UX:
  - project dropdown present
  - manual framework-name import field removed
- Added targeted e2e coverage for expired-session redirect behavior.
