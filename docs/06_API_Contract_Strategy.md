# API contract strategy

## Technical doctrine

Use **OpenAPI-first** contract design before backend and frontend implementation.

## Why

The API contract must be the shared truth between:
- backend
- current temporary frontend
- future stronger frontend
- tests
- export functions

## Contract design scope

Before implementation, define:

### Query APIs
- frameworks list
- client list
- client workspace overview
- indicator list
- indicator detail
- evidence history
- recurring due items
- dashboard summary
- comments/history
- export previews

### Command APIs
- import framework
- create client checklist instance
- assign indicator
- update operational state
- add evidence
- archive evidence version
- request review
- return for revision
- approve
- mark final ready
- submit
- reopen
- save AI recommendation
- accept/reject AI recommendation
- create print pack job
- export monitoring sheet

### Common contract requirements
- request schema
- response schema
- validation rules
- permissions
- errors
- audit behavior
- idempotency expectations where needed

## Command/query separation

Prefer clear action endpoints rather than raw generic PATCH behavior for workflow actions.
For example:
- `/indicators/{{id}}/request-review`
- `/indicators/{{id}}/approve`
- `/indicators/{{id}}/mark-final-ready`
- `/indicators/{{id}}/submit`
- `/indicators/{{id}}/reopen`

## UI-only governance rule

The UI can call these endpoints, but end users must not have alternative hidden direct service routes outside the governed application flow.
