# OpenAPI Alignment Plan and Outcome

## Placeholder state before sprint
- `contracts/openapi/openapi.yaml` existed but was effectively placeholder/non-operational for implemented backend breadth.
- Discovery classified contract-first drift as a primary risk (`paths` not representative of real API).

## What is now covered
The contract was replaced with an implemented-surface OpenAPI definition covering:
- auth/session endpoints
- user and client-profile endpoints (including variable preview)
- admin surfaces (dashboard, users, masters, audit, overrides, import logs)
- frameworks and framework analysis
- projects list/detail/update/create
- project initialize-from-framework and clone
- standards/areas progress, readiness, inspection, pre-inspection
- worklist
- project indicator detail and command endpoints
- evidence create/update/review/list
- recurring queue/submit/approve
- AI advisory generate/accept/list
- export surfaces (excel, print-bundle, physical-retrieval, history, generate)

Additional contract alignment details:
- success/error envelope schemas encoded (`success: true|false` patterns).
- command endpoints explicitly modeled (`start`, `send-for-review`, `mark-met`, `reopen`).
- schema and enum coverage added for key payloads and responses.

## Intentionally omitted (not implemented)
- Any speculative endpoints not present in `backend/apps/api/urls.py`.
- Any future-only features outside currently wired backend views/serializers.

## Mismatches discovered and fixed
1. YAML parse break caused by unquoted `summary` values containing colons in command endpoint descriptions; fixed by quoting those summary strings.
2. Contract now validates as parseable YAML and reports non-placeholder breadth (OpenAPI 3.1.0, 51 paths, 112 schemas).
