# Locked decisions

## Decision 1 — governed work unit

**Locked:** Indicator is the primary governed work unit.

All major application records attach to an indicator:
- assignment
- operational state
- evidence
- comments
- status history
- AI outputs
- review actions
- approval actions

## Decision 2 — source of truth with export outputs

**Locked:** The database is the single canonical source of truth.

Canonical state includes:
- current indicator status
- evidence readiness
- owner, reviewer, approver
- target date
- gap summary
- action required
- final readiness
- submission state

### Allowed exception
The system must support output/export formats for monitoring and communication:
- Excel
- CSV
- PDF summaries
- printable packs
- filtered reporting views

### Rule
Exports are output views only.
They are not governing records unless re-imported through a controlled workflow.

## Decision 3 — frontend-mediated workflow only

**Locked:** All user workflow actions must happen through the frontend UI.

Users must not directly use backend services or hidden system operations.
The architecture must be:

Frontend UI -> API layer -> internal service layer -> database

This means backend logic still exists, but it is not directly exposed to end users as uncontrolled service access.

## Decision 4 — AI advisory role with manual review

**Locked:** AI is advisory only.

AI may:
- classify indicators
- suggest evidence categories
- suggest recurring cadence
- draft documents
- summarize gaps
- provide readiness recommendations
- provide final assessment recommendations

AI may not:
- mark items approved
- mark items submitted
- silently change workflow state
- become the source of truth
- replace human governance

Any AI “final assessment” is only a recommendation until a human accepts or rejects it.

## Decision 5 — contract-first, API-first development

**Locked:** The application must be designed contract-first.

Before implementing features, the following must be frozen:
- domain entities
- workflow commands
- status transitions
- role rules
- request/response schemas
- error structures
- export contracts
- AI interaction contracts

The preferred canonical contract format is OpenAPI.

## Decision 6 — internal product only

**Locked:** This application is for internal operational use only.

The business sells services, not the app.
There is no subscription requirement in scope.
Clients do not directly use the application.
Only verified outputs are shared with clients.

## Decision 7 — hard evidence remains essential

**Locked:** The system must support hard-evidence preparation.

This includes:
- print-ready document sets
- ordered evidence packs
- batch print workflows
- tracking physical evidence location where relevant

The app must not assume that soft-copy evidence alone is sufficient.
