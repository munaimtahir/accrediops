# 00_DOCUMENTATION_INTAKE.md

## 1. Files Reviewed
- `/README.md` (root)
- `/backend/README.md`
- `/frontend/README.md`
- `/exports/README.md`
- `/scripts/README.md`
- `/tests/README.md`
- `/testing_plan.md` (root)
- `/docs/00_Project_Summary.md`
- `/docs/01_Locked_Decisions.md`
- `/docs/02_Product_Vision.md`
- `/docs/03_Full_Feature_Map.md`
- `/docs/04_MVP_and_Phases.md`
- `/docs/05_Architecture_Doctrine.md`
- `/docs/06_API_Contract_Strategy.md`
- `/docs/07_AI_Guardrails.md`
- `/docs/08_AI_Instructions_for_Developers.md`
- `/docs/09_Project_Name_Options.md`
- `/docs/10_Recommended_Additions_and_Deferrals.md`
- `/docs/11_Directory_Structure.md`
- `/docs/12_Backend_App_Map.md`
- `/docs/13_First_Task_List.md`
- `/docs/14_Product_Feasibility_Notes.md`
- `/contracts/openapi/openapi.yaml`
- `/backend/pytest.ini`
- `/frontend/package.json`
- `/frontend/playwright.config.ts`
- `/frontend/vitest.config.ts`
- `/GEMINI.md` (root)

## 2. Testing Instructions Found
- **Backend:**
  - Run `pytest` from `backend/` directory.
  - Configuration in `pytest.ini` includes coverage reporting (`--cov=apps`).
- **Frontend:**
  - `npm run test` for unit/component tests (Vitest).
  - `npm run test:e2e` for E2E tests (Playwright).
  - `npm run lint` for linting.
  - `npm run test:coverage` for Vitest coverage.
- **Root:**
  - `testing_plan.md` outlines strategy for `indicators` app service layer.

## 3. Claimed Application Status
- **Type:** Internal accreditation operations platform.
- **Stack:**
  - Backend: Django 5.2 + DRF 3.16 (Single source of truth).
  - Frontend: Next.js 15 + React 19 + Tailwind CSS (Mediated workflow).
- **Core Unit:** Indicator (Governed work unit).
- **AI Stance:** Advisory only, manual human review required.
- **Contracts:** OpenAPI 3.1.0 defined and implemented.

## 4. Claimed Test Commands
- Backend: `pytest`
- Frontend Unit: `npm run test`
- Frontend E2E: `npm run test:e2e`
- Frontend Lint: `npm run lint`

## 5. Claimed E2E Setup
- Framework: Playwright.
- Config: `frontend/playwright.config.ts`.
- Tests: `frontend/tests/e2e/`.
- Base URL: `http://127.0.0.1:18080` (Caddy proxy).
- Global Setup: `frontend/tests/e2e/global-setup.cjs`.

## 6. Claimed Docker Setup
- `docker-compose.yml` in root manages:
  - Backend
  - Frontend
  - Caddy (port 18080)
- `backend/Dockerfile` and `frontend/Dockerfile` present.

## 7. Claimed Frontend-Backend Contracts
- **Primary Contract:** `/contracts/openapi/openapi.yaml` (OpenAPI 3.1.0).
- **Status:** Claimed as "Implemented contract for AccrediOps governance workflow API".
- Includes Envelopes: Success `{ success: true, data: ... }`, Error `{ success: false, error: ... }`.
- Strategy: Command/Query separation (CQRS-lite).

## 8. Conflicts Between Documents
- **Frontend Framework:** `README.md` (root) mentions "keep current Streamlit bridge temporarily or migrate later to a stronger frontend", while `GEMINI.md` and `frontend/package.json` confirm Next.js 15 is in use. This indicates the root `README.md` (dated 2026-04-02) is slightly outdated regarding the frontend status.
- **Test Locations:** `docs/11_Directory_Structure.md` suggests a top-level `tests/` directory for "Contract tests, service tests, and workflow tests", but implementation shows backend tests inside `backend/apps/*/tests/` and frontend tests inside `frontend/tests/`.

## 9. Missing or Outdated Documentation
- **CI Workflows:** No `.github/workflows` found despite being a "GitHub-ready starter pack".
- **Deployment Docs:** Mentions of "Production" in `GEMINI.md` but no specific production deployment scripts or configs found beyond Docker.
- **Testing instructions for root:** No single root command to run all tests (backend + frontend + e2e).

## 10. Immediate Risk Notes
- **Outdated README:** Root README has outdated info about Streamlit.
- **No CI:** Lack of CI means no automated enforcement of testing or linting on push.
- **Environment Complexity:** Heavily reliant on a working Docker/Caddy setup for E2E tests (port 18080).
- **Indicator Complexity:** The Indicator entity is the "primary governed work unit" with many attachments; testing this comprehensively is critical.
