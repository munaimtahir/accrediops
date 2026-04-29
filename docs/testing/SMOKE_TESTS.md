# Smoke Tests

Primary script: `scripts/devops/smoke_verify.sh`

## Verifies
- frontend reachable (`/`)
- frontend health reachable (`/health/frontend`)
- backend health reachable via proxy (`/health/backend`)
- backend API health reachable (`/api/health/`)
- key page route (`/projects`)
- key API routes (`/api/auth/session/`, `/api/projects/`)

## Usage
```bash
./scripts/devops/smoke_verify.sh
```

Optional:
```bash
BASE_URL=http://127.0.0.1:18080 ./scripts/devops/smoke_verify.sh
```
