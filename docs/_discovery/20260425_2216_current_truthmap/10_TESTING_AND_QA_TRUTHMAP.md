# Testing and QA Truth Map

## A. Test Inventory

| Test File/Folder | Type | Area Covered | Key Assertions | Status |
|---|---|---|---|---|
| `backend/apps/api/tests/` | Unit/Integration | API endpoints, governance logic | Roles, access, status transition guards | COMPLETE |
| `frontend/tests/e2e/` | E2E (Playwright) | App flows, role visibility, auth | Login, navigation, evidence workflow | COMPLETE |
| `frontend/tests/` | Unit (Vitest) | React components | UI rendering, specific states | COMPLETE |

## B. Test Command Results

| Command | Result | Passed | Failed | Error Summary |
|---|---|---|---|---|
| `pytest --collect-only` | Ran | - | - | Coverage module threw permission error on local env. 45 tests collected. |
| `npm run lint` | Interrupted | - | - | Interactive prompt paused execution. |

## C. Coverage Gaps

| Feature | Test Exists? | Type Needed | Priority | Reason |
|---|---|---|---|---|
| Physical File Upload | No | Integration | High | Ensure multipart/form-data works when S3 is connected. |
| Lab/FMS Specifics | No | E2E | High | Lab workflows don't exist yet, need tests once built. |
| Email Notifications | No | Unit/Integration | Medium | Notifications are currently stubbed/missing. |

## D. Recommended Playwright/E2E Test Plan

The existing `frontend/tests/e2e/` covers much of the application. The future test plan should focus on:
- Admin login and client profile creation
- Specific laboratory framework imports
- Negative flows for evidence review rejection
- Concurrency checks for same-indicator updates
