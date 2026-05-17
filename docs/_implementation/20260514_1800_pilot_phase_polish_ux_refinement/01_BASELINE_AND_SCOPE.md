# Baseline and Scope - Pilot-Phase Polish & UX Refinement Sprint

## Current Status
- Core workflow is complete and stable (GO verdict in previous sprint).
- CAPA/Gap backend services are fully functional.
- Audit Log frontend exists but is very technical (JSON dumps).
- E2E tests are passing but rely on some generic selectors.

## Objectives
1. **Frontend CAPA/Gap Controls**:
    - Add "Record Gap" button to Project Evidence Requirements in the Indicator Detail screen.
    - Add "Initialize CAPA" button to Gaps in the Indicator Detail screen.
    - Implement modals for Gap and CAPA creation.
2. **Audit Log UI Enhancement**:
    - Improve readability of the Audit Log entries.
    - provide better summaries of changes instead of just JSON dumps where possible.
3. **E2E Hardening**:
    - Add more `data-testid` attributes to key interactive elements (buttons, modals).
    - Update E2E tests to use these stable IDs.
4. **Fresh Deployment Optimization**:
    - Ensure `docker-compose` and seeding logic are ready for a clean-slate demo.
    - Add a `RESET_STATE.md` or similar if needed for easy demo resets.

## Scope
- Frontend UI components for Gap/CAPA creation.
- Frontend enhancement for Audit Log viewer.
- `data-testid` attributes across core screens (Indicator Detail, Worklist, Recurring).
- Verification of clean-slate deployment.

## Out of Scope
- Major backend refactoring.
- Advanced CAPA analytics.
- Notification engine.
