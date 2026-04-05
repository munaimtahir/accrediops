# Feature Inventory and Status

| Feature | Frontend status | Backend status | E2E status | Final classification | Recommended next action |
|---|---|---|---|---|---|
| Project listing/open | implemented | implemented | partial pass | **WORKING PERFECTLY** | Keep covered. |
| Project creation | missing UI flow | implemented | not verifiable | **NEEDS TO BE BUILT / NOT YET IMPLEMENTED** (frontend exposure) | Add create project screen/form and initialize action UX. |
| Project clone/reuse | implemented | implemented + tested | partially covered | **WORKING PERFECTLY** | Add full E2E create-clone-open flow. |
| Indicator command workflow | implemented | implemented + tested | partially covered | **WORKING PERFECTLY** | Expand browser-level command tests. |
| Evidence add/edit/review | implemented | implemented + tested | not full E2E | **WORKING PERFECTLY** | Add E2E evidence review flow. |
| Physical evidence fields | implemented | implemented + tested | not full E2E | **WORKING PERFECTLY** | Add visual regression/flow checks. |
| Recurring queue submit/approve | implemented (split screens) | implemented + tested | discoverability covered | **WORKING PERFECTLY** | Add end-to-end submission/approval Playwright path. |
| AI generate/accept advisory | implemented | implemented + tested | no deep E2E | **WORKING PERFECTLY** | Add E2E assertions around advisory behavior. |
| Client variable replacement | implemented | implemented + tested | partial | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Improve profile-linking UX and add E2E preview checks. |
| Print pack builder preview | implemented | implemented + tested | route-level covered | **WORKING PERFECTLY** | Add content-level E2E checks. |
| Export history/generate | implemented | implemented + tested | partial | **WORKING PERFECTLY** | Add more workflow E2E. |
| Readiness/inspection | implemented | implemented + tested | partial | **WORKING PERFECTLY** | Add strict E2E outcomes per risk case. |
| Admin dashboard/users/masters | implemented | implemented + tested | partial/failing auth cases | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Resolve auth setup for E2E and expand flows. |
| Admin overrides | list/report UI only | endpoint implemented | not deeply covered | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Add actionable override controls or clarify read-only intent. |
| Framework analysis | implemented | implemented + tested | no deep E2E | **WORKING PERFECTLY** | Add E2E assertion path. |
| OpenAPI contract alignment | not reflected in UI docs | placeholder only | n/a | **NEEDS TO BE BUILT / NOT YET IMPLEMENTED** | Generate/maintain real OpenAPI from implemented API. |
