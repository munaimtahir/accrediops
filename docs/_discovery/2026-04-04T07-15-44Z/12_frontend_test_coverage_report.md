# Frontend Test Coverage Report

## Commands and artifacts
- Build: `NEXT_DIST_DIR=.next_discovery npm run build`
- Tests: `npm run test -- --run`
- Output files:
  - `OUT/discovery/2026-04-04T07-15-44Z/frontend_build_output.txt`
  - `OUT/discovery/2026-04-04T07-15-44Z/frontend_test_output.txt`

## Result summary
- Build: success.
- Unit/component tests: **9 passed**
- Before/after depth: **8 → 9 test files**.

## Newly covered in this pass
1. Project overview role-based clone gating (`project-overview-screen.test.tsx`).

## Already covered (current suite)
- Projects list
- Worklist
- Recurring screen
- Inspection screen
- Evidence form (physical fields)
- Admin dashboard
- Export history
- App shell

## Still undercovered
- Indicator detail command/evidence/AI interactions.
- Client profile screen + preview flow interactions.
- Admin overrides and import logs interactions.
- Error states for some mutation-heavy screens.
