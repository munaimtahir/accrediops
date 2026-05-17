# Baseline and Scope - Recurring Workflow Stabilization Sprint

## Current Status
- Final ZIP export is functional.
- Recurring workflow E2E tests are failing systemically.
- The main symptom is that recurring instances/items are not appearing in the UI during E2E runs.
- Unit tests for recurring workflows pass, but E2E journeys are broken.

## Findings from Previous Triage
1. **08_recurring_workflows.spec.ts**: Fails because it cannot find the first row in the recurring queue.
2. **17_recurring_and_masters_capability_fix.spec.ts**: Fails because "Submit" and "Approve" buttons are not visible in the queue.
3. **core-journeys.spec.ts**: Fails when searching for "Recurring:" tiles.

## Scope
- Fix the deterministic E2E seed (`seed_e2e_state`) to ensure recurring instances are correctly created for the test projects.
- Verify the API response for recurring queues and indicator details.
- Fix frontend selectors or logic in the "Recurring Queue" and "Indicator Detail" screens.
- Achieve stable passing status for:
    - `08_recurring_workflows.spec.ts`
    - `17_recurring_and_masters_capability_fix.spec.ts`
    - `core-journeys.spec.ts` (recurring paths)

## Out of Scope
- Redesigning the recurring workflow logic.
- Adding new recurring frequencies.
- Final ZIP export changes (already verified).
