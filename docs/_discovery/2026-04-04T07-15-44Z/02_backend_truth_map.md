# Backend Truth Map

## Module inventory source
`OUT/discovery/2026-04-04T07-15-44Z/backend_module_inventory.txt`

## Backend app/module truth

| Module | Purpose | Capability maturity |
|---|---|---|
| `api` | DRF views, routing, serializers, envelope responses | **WORKING PERFECTLY** |
| `projects` | Project CRUD, initialization, clone-from-project | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** (UI parity gap) |
| `indicators` | Project indicator state, assignment, progress, governed commands | **WORKING PERFECTLY** |
| `evidence` | Evidence creation/update/review + physical fields | **WORKING PERFECTLY** |
| `recurring` | Requirement/instance generation, submit/approve services | **WORKING PERFECTLY** |
| `ai_actions` | AI generation + accept flows with advisory model | **WORKING PERFECTLY** |
| `exports` | Excel, print-bundle, physical retrieval, history | **WORKING PERFECTLY** |
| `audit` | Event logging and filters | **WORKING PERFECTLY** |
| `workflow` | Permission guards/transitions | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** (coverage still low in some guard paths) |
| `accounts` | User, roles, client profile | **WORKING PERFECTLY** |

## Endpoint and operation truth highlights
- Full route map in `backend/apps/api/urls.py` and `OUT/discovery/.../backend_endpoint_inventory.txt`.
- Explicitly verified in code/tests:
  - project creation (`POST /api/projects/`) exists backend-side.
  - project update (`PATCH /api/projects/{id}/`) exists.
  - initialize-from-framework exists.
  - clone project exists (`POST /api/projects/{id}/clone/`) and tested.
  - indicator command endpoints (`start`, `send-for-review`, `mark-met`, `reopen`) exist and tested.
  - evidence create/update/review exists and tested.
  - recurring queue + submit + approve exists; approve now covered by added test.
  - AI generate/accept exists; non-mutation behavior tested.
  - exports (excel/print/physical/history/generate) exist.
  - client profile and variable preview endpoints exist.
  - admin users/masters/audit/overrides/import endpoints exist.

## Backend maturity classification for mission-critical asks
- **Reuse engine (clone)**: implemented and tested.
- **Client variable replacement**: implemented in profile preview and AI generation path.
- **Print pack builder**: implemented with structured hierarchy and evidence payload.
- **Physical evidence tracking**: implemented on evidence model/API and surfaced in print pack.

## Contract/truth risk
- OpenAPI in `contracts/openapi/openapi.yaml` remains placeholder (`paths: {}`), so contract-first governance is not currently in sync with implemented backend truth.
