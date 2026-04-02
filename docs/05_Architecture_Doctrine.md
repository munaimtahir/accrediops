# Architecture doctrine

## Canonical stack doctrine

This project should follow:

**frontend-mediated, contract-first, API-first, governance-centered architecture**

## Core pattern

Frontend UI -> API contract layer -> internal service layer -> database

## Rules

1. The database is the source of truth.
2. Exports are communication outputs, not governing records.
3. Users interact only through the frontend UI.
4. The API contract is finalized before implementation.
5. Backend services remain internal/private behind the API.
6. Workflow-significant actions must pass through validated application commands.
7. AI output is advisory only and never directly mutates governance state.
8. Hard-evidence output and print-pack support are first-class concerns.

## Why this doctrine matters

Without this doctrine, the system can easily drift back into:
- spreadsheet logic spread across places
- unclear source of truth
- fragile UI-driven state
- ad hoc approvals
- AI overreach
- document chaos
