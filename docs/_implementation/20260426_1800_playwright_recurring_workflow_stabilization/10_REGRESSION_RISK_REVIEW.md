# Regression and Risk Review

## Risk Areas

| Risk Area | Status | Evidence | Recommended Follow-up |
|-----------|--------|----------|-----------------------|
| Role/Capability Mismatch | **Resolved** | `test_recurring_queue_capabilities` unit test and `Recurring queue row action visibility` E2E test. | Continue ensuring all new features include capability flags. |
| Dashboard Simplification Impact | **Acceptable** | Redesigned dashboard verified via `Simplified project dashboard` E2E test. | Monitor user feedback on removed secondary cards. |
| Admin Masters Edit Side Effects | **Resolved** | Verified edit UI and `MasterValue` updates via `Admin masters edit` E2E test. | None. |
| Playwright Environment Fragility | **Resolved** | Stabilized hydration waiting and seed data. Tests passing consistently with clean rebuilds. | None. |
| Seed Data Assumptions | **Resolved** | Updated `seed_e2e_state` to include assignments and master values. | Keep seed command in sync with model changes. |

## Remaining Risks
- **Long Build Times:** The frontend rebuild inside Docker Compose is slow due to `npm install` and `next build`. This can lead to frustration during rapid local development if a full restart is needed.
- **Strict Selector Drift:** As the UI evolves, scoped locators (like `.rounded-xl`) may become fragile.

## Final Assessment
The core workflow loop for recurring tasks is now stable and fully verified. The UI simplification has been achieved without breaking existing functionality or navigation for authorized users.
