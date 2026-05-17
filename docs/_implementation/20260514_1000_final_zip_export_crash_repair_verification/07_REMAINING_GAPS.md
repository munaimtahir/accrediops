# Remaining Gaps - Final ZIP Export Crash Repair & Verification

## 1. Recurring Workflow E2E Stability
- **Gap:** Multiple E2E tests for recurring workflows are failing.
- **Impact:** We cannot automatically verify the full recurring workflow lifecycle in the browser.
- **Recommendation:** Dedicated "Recurring Workflow Stabilization" sprint to fix seed data and selectors.

## 2. CAPA UI Integration
- **Gap:** While the backend and ZIP export for CAPA work perfectly, the frontend modals for creating/editing CAPAs from the Gap list were not fully verified in this sprint.
- **Impact:** Users might be limited in how they interact with CAPAs in the UI.

## 3. Production Deployment Hardening
- **Gap:** Media storage for exports in a production environment (e.g., S3 or protected local volume) needs to be finalized.
- **Impact:** The current `/media/exports/` approach is suitable for development but needs security review for production.

## 4. Advanced CAPA Analytics
- **Gap:** Out of scope for this sprint.
- **Impact:** Only basic CAPA lists and summaries are available in the export.
