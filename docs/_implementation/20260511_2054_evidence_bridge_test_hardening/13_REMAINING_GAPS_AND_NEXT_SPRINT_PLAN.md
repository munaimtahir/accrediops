# Remaining Gaps and Next Sprint Plan

## A. Must fix before feature expansion

- None in the core evidence bridge.

## B. Should fix soon

- Make requirement-level rows obvious in the frontend.
- Update Playwright fixtures so they no longer assume a single framework.

## C. Can defer

- Final ZIP export engine.
- CAPA workflow completion.
- Suggestion acceptance UI.

## D. Nice to have

- Reduce verification artifact churn.
- Add more targeted readiness edge-case tests.

## Recommended next sprint title

`Evidence Matrix Frontend Alignment Sprint`

### Why this sprint is next

- Backend evidence bridging is stable.
- The next high-value gain is UX clarity for accreditation operators.

### Scope

- Make indicator-level requirement rows visible and easy to scan.
- Show status, blockers, and human-review state clearly.
- Preserve the advisory-only AI posture.

### Acceptance criteria

- Requirement rows visible in project indicator detail.
- Missing/partial/approved statuses are obvious.
- No regression in backend bridge tests.

### Tests required

- Frontend unit tests for the matrix component
- Existing bridge backend tests remain green
- A focused Playwright path for indicator detail and readiness

### Files likely involved

- frontend/components/screens/indicator-detail-screen.tsx
- frontend/components/screens/project-readiness-screen.tsx
- frontend/components/screens/project-print-pack-screen.tsx
- frontend hooks and API clients for project indicators / evidence

### What not to include

- CAPA implementation
- final ZIP export engine
- broad backend refactors

