# 05 Operator Validation

## Scenario

Validated against the target path:

`login -> create/open project -> open worklist -> open indicator -> add evidence -> review -> approve`

## What Changed

- The target screens now expose explicit next actions instead of passive status text.
- Export and override surfaces explain blockers before the user attempts the action.
- Indicator detail now surfaces workflow blockers in operator language:
  missing evidence, rejected evidence, recurring compliance, and role restrictions.

## Verification Notes

- Backend governance tests cover permission denial and export blocking.
- Frontend unit tests cover overview, readiness, recurring, export, print-pack, and override surfaces.
- Playwright specs were added for:
  `permission-enforcement.spec.ts`
  `export-guard.spec.ts`
  `next-action-consistency.spec.ts`
  `operator-first-time.spec.ts`

## Residual Validation Gap

- The new Playwright specs could not be executed in this session because the app server was not running at `http://127.0.0.1:18080`.
- Global setup failed with `ERR_CONNECTION_REFUSED`.

## First-Time User Verdict

- Core operating screens are now materially more self-guided.
- Export misuse is blocked both in UI and backend.
- Override execution is explicit and confirmable instead of buried in a different screen.
