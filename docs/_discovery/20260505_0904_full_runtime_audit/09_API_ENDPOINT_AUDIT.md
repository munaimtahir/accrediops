# API Endpoint Audit

## Overview
The API endpoints are strictly governed by `contracts/openapi/openapi.yaml` and implemented using Django REST Framework in `backend/apps/`.

## Observations
- **Authentication:** Token-based or session-based (JWT inferred from `test_auth_api.py`). Endpoints require authentication except for login/health endpoints.
- **Organization:** Modularized under `/api/`.
  - `/api/auth/`
  - `/api/frameworks/`
  - `/api/projects/`
  - `/api/evidence/`
  - `/api/ai_actions/`
  - `/api/masters/`
  - `/api/admin/`

## Health and Connectivity
- Endpoint `/api/system/health/` exists and is utilized by Docker health checks.

## Gaps
Because Docker timed out during build, a live curl smoke test was omitted to preserve audit integrity. The OpenAPI spec enforces the shape, but an automated contract test is highly recommended as a next step.
