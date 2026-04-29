# Test Evidence

## Commands and outcomes

| Command | Result |
|---|---|
| `cd backend && python manage.py test` | **PASS** (`40` tests passed) |
| `cd backend && python manage.py test apps.api.tests.test_frameworks_api -v 2` | **PASS** (`9` tests passed) |
| `cd frontend && npm run test` | **PASS** (`20` files / `37` tests passed) |
| `cd frontend && npm run build` (with `NEXT_DIST_DIR=.next_local_checks`) | **PASS** (build + type checks succeeded) |
| `cd frontend && npx playwright test ...app-flows.spec.ts --grep \"protected routes...|expired session...\"` | **PASS** (`2`/`2` targeted auth redirect tests) |
| `curl -I http://127.0.0.1:18080/projects` (and protected variants) while logged out | **PASS** (`307` redirects to `/login?next=...`) |
| `curl -I http://127.0.0.1:18080/admin/` | **PASS** (`308` to `/django-admin/`) |
| `curl -I http://127.0.0.1:18080/django-admin/login/` | **PASS** (`200`) |
| `curl -I http://127.0.0.1:18080/static/admin/css/base.css` | **PASS** (`200`) |
| Django admin login via POST to `/django-admin/login/` with CSRF + cookies | **PASS** (`302` to `/django-admin/`, authenticated page `200`) |

## Additional notes
- Full `app-flows.spec.ts` suite includes pre-existing assertion/time-window failures unrelated to this sprint’s guarded-route and import-contract fixes; targeted auth redirect scenarios pass.
- Frontend lint command (`next lint`) is not currently non-interactive in this workspace (prompts for ESLint setup).
