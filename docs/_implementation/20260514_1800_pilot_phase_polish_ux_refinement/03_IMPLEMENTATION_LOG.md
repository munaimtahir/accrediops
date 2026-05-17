# Implementation Log - Pilot-Phase Polish & UX Refinement Sprint

## 1. Fresh Deployment Baseline
- Triggered a clean-slate deployment using `docker compose down -v && docker compose up -d --build`.
- Verified deterministic database seeding with `seed_e2e_state`.
- **Backend Fixes**: Addressed two baseline test failures related to `AI_DEMO_MODE` overriding expectations by using Django's `@override_settings` in `test_document_drafting.py` and `test_evidence_and_ai.py`.

## 2. Frontend: Gap and CAPA UX
- **Forms**: Created `RecordGapForm` and `InitializeCapaForm` components.
- **Hooks**: Added `useRecordGap`, `useInitializeCapa`, and `useCapaAction` to `frontend/lib/hooks/use-mutations.ts`.
- **UI Integration**: 
    - Updated `IndicatorDetailScreen` to display "Record Gap" and "Initialize CAPA" buttons directly on the Evidence Requirements panel.
    - Embedded the forms within `Modal` components for a seamless contextual workflow.

## 3. Frontend: Audit Log Readability
- **Component**: Created an `AuditChanges` component in `admin-audit-screen.tsx`.
- **Logic**: Replaced raw JSON string dumps with a parsed, human-readable differential list of field changes (e.g., `status: DRAFT -> ACTIVE`).
- **UX**: Retained access to the raw JSON payloads via a "Show raw JSON" toggle for advanced debugging.

## 4. Frontend: E2E Hardening
- Added `data-testid` attributes to critical interactive elements across the application to reduce reliance on brittle text/layout selectors:
    - Sidebar navigation links (`nav-admin-dashboard`, `nav-ai-usage`, etc.).
    - Action Dialog components (`dialog-cancel-btn`, `dialog-confirm-btn`).
    - Modals (`modal-close-btn`).
    - Indicator detail panel tabs and primary action buttons.
