# 08 Worklist 500 root cause

## Endpoint under investigation

- `GET /api/dashboard/worklist/`
- Failure trigger path: UI “show all” behavior (`page_size=all`)

## Findings

- In clean-state reproduction, route returned 200 (no hard 500 reproduced).
- Risk area identified: pagination `page_size` coercion could reject non-numeric values and cause server-side failure paths depending on request shape.

## Diagnostic evidence

- Explicit probe: `/api/dashboard/worklist/?project_id=<id>&page_size=all`
- Playwright regression: `04_worklist_core.spec.ts`
- Backend regression: `test_worklist_accepts_show_all_page_size_without_server_error`
