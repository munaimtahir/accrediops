# E2E Deepening

## Workflow depth added
- Extended governance E2E from route checks to lifecycle checks:
  1. Admin override lifecycle: evidence+review+met -> reopen with reason -> audit/override visibility.
  2. Non-admin denial lifecycle: non-admin cannot reopen MET indicator.
  3. Export lifecycle: generate job -> history row -> persisted status.
  4. Combined lifecycle: create -> evidence -> recurring submit/approve -> export generate/history status.

## New E2E test additions
- File: `frontend/tests/e2e/core-journeys.spec.ts`
  - `admin override reopens met indicator and audit evidence is visible`
  - `non-admin user cannot reopen met indicator`
  - `export lifecycle creates history row with persisted status`
  - `non-admin user cannot access export history actions`
  - `combined governance path: create, evidence, recurring, export`

## Failure classification during implementation
- One class of instability expected/handled: selector ambiguity in dense indicator page actions.
- Mitigation applied:
  - scoped modal locators (`div.fixed.inset-0`). 
  - route/API-assisted ID resolution for deterministic navigation.

## Coverage depth status
- Evidence lifecycle: add + review + approval verified.
- Recurring lifecycle: submit + approve verified.
- Clone lifecycle: clone + open workspace verified.
- Governance lifecycle: reopen override + audit visibility verified.
- Export lifecycle: generate + history + status verified.

## Remaining shallow areas
- Admin override bulk operations (if introduced later) not in scope.
- Long-running export states (queued/processing async transitions) remain limited because current implementation is synchronous READY/WARNING persistence.

