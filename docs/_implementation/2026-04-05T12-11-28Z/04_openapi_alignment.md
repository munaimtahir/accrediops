# OpenAPI Alignment

## Placeholder status
- `contracts/openapi/openapi.yaml` is already a populated implementation contract (not empty/placeholder in this sprint baseline).

## Alignment verification performed
- Compared backend URL registry (`backend/apps/api/urls.py`) against OpenAPI path keys.
- Normalized dynamic path parameters (`<int:...>` and `{...}`) and verified set parity.
- Result: no normalized endpoint gaps between backend URL patterns and OpenAPI paths.

## Real behavior surfaces covered
- Auth/session:
  - session, login, logout
- Projects:
  - list/create/detail/update/init/clone
  - readiness/inspection/pre-inspection/progress summaries
- Frameworks:
  - list + analysis
- Indicators:
  - detail/assign/update-working-state/start/send-for-review/mark-met/reopen
- Evidence:
  - create/update/review/list by project-indicator
- Recurring:
  - queue/submit/approve
- AI advisory:
  - generate/list outputs/accept
- Exports:
  - excel/print-bundle/physical-retrieval/history/generate
- Admin/governance:
  - dashboard/masters/users/audit/overrides/import validation/import logs
- System health + user/client-profile surfaces.

## Mismatches discovered and fixed
- No backend URL vs OpenAPI path mismatch found in this sprint validation.
- Contract-sensitive verification artifact is captured in:
  - `OUT/implementation/2026-04-05T12-11-28Z/feature_flow_checks.txt`

## Intentionally omitted
- No future or speculative endpoints were added.
- Contract remains aligned only to currently implemented routes.

