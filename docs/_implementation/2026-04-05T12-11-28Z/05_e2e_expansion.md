# E2E Expansion

## Scope executed after auth/create baseline
- Kept Phase A/B as gate: auth deterministic + create/init deterministic.
- Expanded browser coverage to additional operational paths with real backend wiring.

## New/expanded Playwright coverage
- `frontend/tests/e2e/core-journeys.spec.ts`
  - Evidence lifecycle path (add evidence with physical fields, review, approved state)
  - Recurring lifecycle path (submit instance, approve instance)
  - Create flow with optional client profile linkage
  - Clone project and open cloned workspace
  - Admin route access after login

## Failure classification during sprint
- Clone flow failure was a test timing/assertion issue (route transition race), not backend clone failure.
- Resolution:
  - Introduced URL transition predicate wait to ensure project route changed before assertion.

## Stable assumptions for future E2E
- Reuse shared login helper for every spec.
- Use scoped modal selectors for command forms.
- Prefer deterministic route/API-assisted navigation when UI card text matching is ambiguous.

## Remaining E2E depth gaps
- Admin override decision flows (beyond page-level access) remain to be expanded.
- Full export-generation lifecycle assertions (job status transitions) remain.
- Additional negative-permission E2E matrix can be added for non-admin roles.

