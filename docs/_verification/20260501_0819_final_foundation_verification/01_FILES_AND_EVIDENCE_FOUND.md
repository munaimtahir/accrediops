# Files and Evidence Found

This file records whether required files exist and whether they were meaningfully populated.

Statuses:
- FOUND
- MISSING
- EMPTY / HEADING ONLY
- REVIEWED
- NOT NEEDED

## Reference Paths

All requested reference paths were present at time of verification (2026-05-01 08:19 UTC):

- FOUND `docs/_implementation/20260430_2003_hardening_stabilization_sprint/`
- FOUND `docs/_implementation/20240501_1000_foundation_framework_rbac_ai_governance_document_queue/`
- FOUND `docs/_contracts/20260430_2003_frontend_backend_contract_update/`
- FOUND `docs/_truthmap/20260430_1050_full_testing_contract_fe_be_truthmap/`
- FOUND `TESTING.md`
- FOUND `frontend/playwright.config.ts`
- FOUND `frontend/tests/e2e/global-setup.cjs`
- FOUND `frontend/tests/e2e/15_smoke_clean_new_app_mode.spec.ts`
- FOUND `frontend/tests/e2e/20_indicator_classification_workflow.spec.ts`

## Backend

| Path | Status | Notes |
|---|---|---|
| `backend/apps/projects/management/commands/reset_lab_state.py` | FOUND | Reviewed in `02_RESET_LAB_STATE_VERIFICATION.md` |
| `backend/apps/projects/tests/test_reset_lab_state.py` | MISSING | Test gap |
| `backend/apps/masters/management/commands/seed_master_data.py` | MISSING | Command not found under expected name |
| `backend/apps/masters/management/commands/seed_master_values.py` | FOUND | Reviewed in `03_MASTER_DATA_AND_POLICY_SEEDING.md` |
| `backend/apps/masters/management/commands/seed_policies.py` | FOUND | Reviewed in `03_MASTER_DATA_AND_POLICY_SEEDING.md` |
| `backend/apps/masters/models.py` | FOUND | Reviewed in `04_FRAMEWORK_PROJECT_ARCHITECTURE_CHECK.md` |
| `backend/apps/masters/choices.py` | FOUND | Reviewed in `03_MASTER_DATA_AND_POLICY_SEEDING.md` |
| `backend/apps/api/views/frameworks.py` | FOUND | Reviewed in `04_FRAMEWORK_PROJECT_ARCHITECTURE_CHECK.md` |
| `backend/apps/api/views/admin.py` | FOUND | Used for parity review in `10_UI_BACKEND_PARITY_REVIEW.md` |
| `backend/apps/api/serializers/admin.py` | FOUND | Used for parity review in `10_UI_BACKEND_PARITY_REVIEW.md` |
| `backend/apps/ai_actions/models/` | FOUND | Directory present |
| `backend/apps/ai_actions/services/` | FOUND | Directory present |
| `backend/apps/projects/services.py` | FOUND | Reviewed in `04_FRAMEWORK_PROJECT_ARCHITECTURE_CHECK.md` |
| `backend/apps/recurring/models.py` | MISSING | Either moved/renamed or not implemented |
| `backend/apps/recurring/models/recurring.py` | FOUND | Actual recurring models live here (expected path differs) |
| `backend/apps/indicators/models/` | FOUND | Directory present |

## Frontend

| Path | Status | Notes |
|---|---|---|
| `frontend/components/screens/admin-document-generation-queue-screen.tsx` | FOUND | Reviewed in `06_FRONTEND_BUILD_AND_TEST_STATUS.md` |
| `frontend/components/screens/document-draft-review-screen.tsx` | FOUND | Reviewed in `06_FRONTEND_BUILD_AND_TEST_STATUS.md` |
| `frontend/components/screens/indicator-classification-screen.tsx` | FOUND | Reviewed in `10_UI_BACKEND_PARITY_REVIEW.md` |
| `frontend/components/screens/admin-ai-usage-screen.tsx` | FOUND | Reviewed in `10_UI_BACKEND_PARITY_REVIEW.md` |
| `frontend/components/layout/sidebar.tsx` | FOUND | Reviewed in `10_UI_BACKEND_PARITY_REVIEW.md` |
| `frontend/tests/e2e/15_smoke_clean_new_app_mode.spec.ts` | FOUND | Used in Playwright verification |
| `frontend/tests/e2e/20_indicator_classification_workflow.spec.ts` | FOUND | Used in Playwright verification |
| `frontend/playwright.config.ts` | FOUND | Used in Playwright verification |
| `frontend/tests/e2e/global-setup.cjs` | FOUND | Used in Playwright verification |
| `frontend/package.json` | FOUND | Used to discover runnable commands |
| `frontend/package-lock.json` | FOUND | Used to confirm dependency graph |

## Documentation

| Path | Status | Notes |
|---|---|---|
| `TESTING.md` | FOUND | Reviewed in `05_BACKEND_TEST_STATUS.md` and `06_FRONTEND_BUILD_AND_TEST_STATUS.md` |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/` | FOUND | Reviewed in `09_FRONTEND_BACKEND_CONTRACT_REVIEW.md` |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/00_CONTRACT_OVERVIEW.md` | FOUND | Content present |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/01_API_ROUTE_CONTRACT.md` | EMPTY / HEADING ONLY | Heading only (`# API Route Contract`) |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/02_FRONTEND_SCREEN_CONTRACT.md` | EMPTY / HEADING ONLY | Heading only (`# Frontend Screen Contract`) |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/03_FRONTEND_ACTION_TO_BACKEND_MAP.md` | EMPTY / HEADING ONLY | Heading only (`# Frontend Action to Backend Map`) |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md` | EMPTY / HEADING ONLY | Heading only (`# Backend Endpoint to Frontend Map`) |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/05_DATA_FIELD_CONTRACT.md` | FOUND | Content present |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/06_RBAC_CAPABILITY_CONTRACT.md` | EMPTY / HEADING ONLY | Heading only (`# RBAC Capability Contract`) |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/07_STATUS_WORKFLOW_CONTRACT.md` | EMPTY / HEADING ONLY | Heading only (`# Status Workflow Contract`) |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/08_TESTING_CONTRACT.md` | EMPTY / HEADING ONLY | Heading only (`# Testing Contract`) |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/09_DRIFT_PREVENTION_RULES.md` | FOUND | Content present |
| `docs/_contracts/20260430_2003_frontend_backend_contract_update/10_CONTRACT_GAPS_AND_DECISIONS.md` | FOUND | Content present |
