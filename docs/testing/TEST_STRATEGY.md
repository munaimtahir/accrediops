# Test Strategy

## Test pyramid
1. Unit tests: pure helpers, transformations, risk/readiness logic.
2. Service tests: workflow command services, evidence/recurring/exports/admin services.
3. API contract tests: DRF endpoints, envelope shape, permissions, command actions.
4. Integration tests: route + DB + service interactions.
5. E2E tests (Playwright): real browser against live stack through proxy.

## Critical E2E flows
- Project/worklist/indicator navigation
- Evidence add/review and MET gating
- Recurring submit/approve and overdue behavior
- AI generate/accept with non-mutation rule
- Clone/project profile/print pack/inspection/export/admin pages

## Coverage standards
- Backend: high line coverage, strong branch coverage for services and command paths.
- Frontend: route/page smoke coverage + key interactive behavior tests.
- E2E: critical workflow scenarios and authorization blocking checks.

## Done definition for test readiness
- Backend tests pass with coverage output.
- Frontend unit/component tests pass.
- Playwright suite passes against live stack.
- Smoke verification passes through proxy paths.
- Coverage matrix updated with covered/partial/missing truth.
