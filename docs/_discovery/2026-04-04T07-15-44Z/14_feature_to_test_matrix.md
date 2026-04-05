# Feature to Test Matrix

| Feature | Frontend route/component | Backend endpoint/service | Current test coverage | Missing tests | Recommended test type | Priority |
|---|---|---|---|---|---|---|
| Login/session | `/login`, `AuthGuard` | auth views | backend covered, E2E partial/failing | successful login E2E | Playwright | P0 |
| Projects list/open | `/projects`, project overview | project list/detail views | frontend+backend covered | robust E2E open flow | Playwright | P1 |
| Project create/init | *(missing UI surface)* | project create + initialize | backend exists, no FE/E2E path | create/init UI + full flow tests | FE + E2E | P0 |
| Clone project | clone modal/form | clone service/view | backend covered, FE partial | E2E clone+open | Playwright | P1 |
| Worklist | worklist screen | dashboard worklist view | FE+backend covered | richer E2E filter assertions | Playwright | P1 |
| Indicator commands | indicator detail toolbar | project indicator command views | backend covered | FE interaction + E2E command sequence | FE + E2E | P1 |
| Evidence flows | evidence forms/review | evidence services/views | FE+backend covered | E2E create-review-approval path | Playwright | P1 |
| Recurring flows | recurring screen + indicator modal | recurring services/views | backend covered incl. approve; FE partial | E2E submit+approve | Playwright | P1 |
| AI advisory | indicator AI panel | AI services/views | backend covered | FE interaction + E2E advisory checks | FE + E2E | P2 |
| Client variables | client profile form | client profile + variables preview | backend partial + FE surface | FE integration + E2E preview flow | FE + E2E | P1 |
| Print pack | print pack screen | print bundle export service | backend covered, FE partial | E2E content checks | Playwright | P2 |
| Admin overrides | admin overrides screen | admin overrides view | backend covered, FE shallow | FE behavior + E2E auth path | FE + E2E | P1 |
