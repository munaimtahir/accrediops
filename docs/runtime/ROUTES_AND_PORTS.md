# Routes and Ports

| Service | Container Name | Internal Port | External Port | Public Route | Internal Route |
|---|---|---:|---:|---|---|
| Frontend (Next.js) | `accrediops-frontend` | 3000 | via Caddy 8080 | `/`, `/projects/*`, `/admin/*` | `http://frontend:3000` |
| Backend (Django API) | `accrediops-backend` | 8000 | via Caddy 8080 | `/api/*` | `http://backend:8000/api/*` |
| Reverse Proxy (Caddy) | `accrediops-caddy` | 8080 | 8080 | all browser traffic | rewrites/proxy to frontend/backend |

## Notes
- API traffic is path-routed by Caddy on `/api/*`.
- Frontend client-side routes are proxied to frontend service to avoid refresh 404s.
- Auth-protected endpoints are considered healthy if they resolve with expected auth status (200/401/403), not only 200.
