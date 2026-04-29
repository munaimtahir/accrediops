# Django Admin Access Note

## Final admin path
- Primary Django admin route: **`/django-admin/`**
- Alias: **`/admin/`** redirects (`308`) to `/django-admin/`

## Proxy pathing
- Caddy forwards:
  - `/django-admin*` to backend
  - `/static/admin/*` and `/static/rest_framework/*` to backend
- Caddy preserves frontend ownership of `/admin` and `/admin/*` (workbench admin UI routes).

## Required assumptions / config
- Backend service healthy and reachable from proxy.
- Django admin app enabled and URL mounted.
- Admin static assets available under `/static/admin/*`.
- Valid Django superuser exists (or equivalent admin credentials provisioned).
- Session/CSRF settings compatible with deployment protocol and trusted origins configuration.
