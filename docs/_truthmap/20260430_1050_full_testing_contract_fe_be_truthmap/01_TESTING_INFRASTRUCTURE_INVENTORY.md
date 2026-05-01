# 01_TESTING_INFRASTRUCTURE_INVENTORY.md

## 1. Backend Testing Inventory

| Test Type | Exists | File/Location | Command | Runs Successfully | Output Captured | Coverage | Gap Severity |
|-----------|--------|---------------|---------|-------------------|-----------------|----------|--------------|
| Unit (Models/Logic) | Partial | `backend/apps/*/tests/` | `pytest` | Not attempted | No | Unknown | Low |
| Service Layer | Yes | `backend/apps/*/tests/test_services.py` | `pytest` | Not attempted | No | Good | Low |
| API / Integration | Yes | `backend/apps/api/tests/` | `pytest` | Not attempted | No | Good | Low |
| Permissions / RBAC | Yes | `backend/apps/api/tests/test_auth_api.py`, `test_governance_hardening.py` | `pytest` | Not attempted | No | Good | Low |
| AI Integration | Yes | `backend/apps/api/tests/test_ai_generation_gemini.py`, `test_evidence_and_ai.py` | `pytest` | Not attempted | No | Partial | Low |
| Audit Trail | Yes | Covered in API and Service tests | `pytest` | Not attempted | No | Partial | Low |

## 2. Frontend Testing Inventory

| Test Type | Exists | File/Location | Command | Runs Successfully | Output Captured | Coverage | Gap Severity |
|-----------|--------|---------------|---------|-------------------|-----------------|----------|--------------|
| Type Checking | Yes | Root/Frontend | `npx tsc --noEmit` (manual) | Not attempted | No | Good | Medium (No script) |
| Linting | Yes | `frontend/` | `npm run lint` | Not attempted | No | N/A | Low |
| Unit (Utils/Hooks) | Yes | `frontend/tests/` | `npm run test` | Not attempted | No | Good | Low |
| Component Tests | Yes | `frontend/tests/` | `npm run test` | Not attempted | No | Good | Low |
| UI/Snapshot | Partial | `frontend/tests/` | `npm run test` | Not attempted | No | Partial | Medium |

## 3. End-to-End (E2E) Testing Inventory

| Test Type | Exists | File/Location | Command | Runs Successfully | Output Captured | Coverage | Gap Severity |
|-----------|--------|---------------|---------|-------------------|-----------------|----------|--------------|
| Core Journeys | Yes | `frontend/tests/e2e/core-journeys.spec.ts` | `npm run test:e2e` | Not attempted | No | Good | Low |
| Auth / Login | Yes | `frontend/tests/e2e/00_runtime_and_auth.spec.ts` | `npm run test:e2e` | Not attempted | No | Good | Low |
| Dashboard / Admin | Yes | `frontend/tests/e2e/12_admin_surfaces.spec.ts` | `npm run test:e2e` | Not attempted | No | Good | Low |
| AI Flows | Yes | `frontend/tests/e2e/09_ai_advisory_non_mutation.spec.ts` | `npm run test:e2e` | Not attempted | No | Partial | Low |
| Role-Based Access | Yes | `frontend/tests/e2e/13_role_visibility_and_authorization.spec.ts` | `npm run test:e2e` | Not attempted | No | Good | Low |
| Accessibility | Yes | `frontend/tests/e2e/19_accessibility.spec.ts` | `npm run test:e2e` | Not attempted | No | Good | Low |

## 4. Runtime & Infrastructure Inventory

| Component | Exists | File/Location | Command | Runs Successfully | Gap Severity |
|-----------|--------|---------------|---------|-------------------|--------------|
| Docker Compose | Yes | `/docker-compose.yml` | `docker-compose up` | Not attempted | Low |
| Backend Service | Yes | `/backend/Dockerfile` | N/A | Not attempted | Low |
| Frontend Service | Yes | `/frontend/Dockerfile` | N/A | Not attempted | Low |
| Caddy Proxy | Yes | `/infra/caddy/Caddyfile` | N/A | Not attempted | Low |

## 5. Continuous Integration (CI)

| Component | Exists | File/Location | Command | Runs Successfully | Gap Severity |
|-----------|--------|---------------|---------|-------------------|--------------|
| CI Workflows | No | `.github/workflows/` | N/A | N/A | High |

## 6. Summary of Gaps & Risks
- **CI/CD Absence:** There is no automated pipeline to run these extensive test suites. High risk of regression if tests are not run manually.
- **Frontend Type-Check Script:** `package.json` lacks a dedicated `type-check` script, though TypeScript is used.
- **Root Orchestration:** No top-level Makefile or script to run all tests across backend, frontend, and E2E in one go.
- **E2E Dependency:** E2E tests are heavily dependent on the full Docker stack (Caddy + Backend + Frontend) being up and healthy on specific ports (18080).
