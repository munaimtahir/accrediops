# Test Commands and Results

## Backend Tests
**Command:** `cd backend && pytest --maxfail=10`
**Environment Assumptions:** standard local python environment, sqlite db.
**Pass/Fail:** Fail.
**Runtime Output Summary:** Syntax error in `apps/indicators/tests/test_services.py` on line 116 (`def test_assign_project_indicator_success(self):` invalid syntax due to unclosed parenthesis from a previous statement).
**Failure Classification:** Code failure (Syntax error).

## Frontend Tests
**Command:** `cd frontend && npm run test:coverage`
**Environment Assumptions:** Node.js, vitest configured.
**Pass/Fail:** Pass.
**Runtime Output Summary:** 53 tests passed across 27 files. Overall coverage is 48.92% statements, 44.62% branches, 32.69% functions, 49.25% lines.
**Failure Classification:** N/A.

**Command:** `cd frontend && npm run build`
**Environment Assumptions:** Node.js.
**Pass/Fail:** Fail.
**Runtime Output Summary:** `Type error: Type '{ children: Element; open: boolean; title: string; description: string; onClose: () => void; size: string; }' is not assignable to type... Property 'size' does not exist on type...` in `components/screens/admin-document-generation-queue-screen.tsx`. (Attempted to fix one error, but another error was revealed).
**Failure Classification:** Code failure (Type error).

## Docker Build & Run
**Command:** `docker compose up -d --build`
**Environment Assumptions:** Docker installed.
**Pass/Fail:** Fail (Frontend service).
**Runtime Output Summary:** `accrediops-backend` built and healthy. `accrediops-frontend` built image successfully, but container exited with code 1 during startup script (`npm install --include=dev && npm run build && npm run start`).
**Failure Classification:** Code failure (Frontend build error inside container).

## Playwright/E2E
**Command:** `npx playwright test`
**Pass/Fail:** Blocked.
**Runtime Output Summary:** The frontend application cannot build, preventing the Next.js server from starting. Without the server running, E2E testing cannot proceed.
**Failure Classification:** Test setup failure (Blocked by upstream frontend build failure).