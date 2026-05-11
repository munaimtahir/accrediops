# Architecture doctrine

## Canonical stack doctrine

This project should follow:

**frontend-mediated, contract-first, API-first, governance-centered development**

Meaning:
- the API contract is finalized before implementation
- all user actions happen through the frontend UI
- backend services remain internal behind the API layer
- database is the single source of truth
- exports are communication outputs, not governing records
- AI is advisory and manually reviewed

## Core pattern

Frontend UI → API contract layer → internal service layer → database

## Rules

1. The database is the single source of truth.
2. Exports are communication outputs, not governing records.
3. Users interact only through the frontend UI.
4. The API contract is finalized before implementation.
5. Backend services remain internal/private behind the API.
6. Workflow-significant actions must pass through validated application commands.
7. AI output is advisory only and never directly mutates governance state. AI can **classify indicators** and **suggest evidence requirements** based on indicator analysis. These suggestions are saved as drafts and require human review before they can be acted upon.
8. Hard-evidence output and print-pack support are first-class concerns.

## Core Workflow Chain

The application must support the following complete chain, ensuring traceability from framework to final output:

Framework
→ Framework Area / Domain
→ Standard
→ Framework Indicator
→ **Evidence Requirement**
→ Project Indicator
→ Evidence Fulfillment (Generated Draft / Uploaded Proof)
→ Evidence Review
→ Gap / CAPA
→ Approval
→ Final Inspection Pack

## Why this doctrine matters

Without this doctrine, the system can easily drift back into:
- spreadsheet logic spread across places
- unclear source of truth
- fragile UI-driven state
- ad hoc approvals
- AI overreach
- document chaos
