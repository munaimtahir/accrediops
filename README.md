# AccrediOps starter pack

Prepared: 2026-04-02

## What this pack is

This is a GitHub-ready starter pack for the internal accreditation services application discussed in the project context.
It is designed for internal company use only. The application is not intended to be sold directly to clients, exposed as a SaaS product, or used as a public-facing portal.

The application exists to help your team:

- load accreditation frameworks and checklists
- classify indicators by evidence type and working pattern
- manage client-specific accreditation workspaces
- track evidence readiness and closure
- maintain recurring evidence items
- reuse completed accreditation structures for future clients
- generate and organize print-ready hard evidence packs
- use AI as an internal advisory layer with manual human review

## Recommended working name

**AccrediOps**

Why this is the recommended working name:
- emphasizes accreditation operations, not just reporting
- fits an internal service-delivery tool
- works well as a GitHub repo and project codename
- does not overpromise a public product identity

Suggested repo name:
- `accrediops`

Alternative names are listed in `docs/09_Project_Name_Options.md`.

## What is included

- locked decisions
- product vision
- full feature map
- MVP and phased rollout
- architecture doctrine
- API-first contract strategy
- AI instructions, restrictions, and guardrails
- initial directory scaffold
- first-pass task list
- initial OpenAPI placeholder

## Build doctrine

This project should follow:

**contract-first, API-first, frontend-mediated, governance-centered development**

Meaning:
- the API contract is finalized before implementation
- all user actions happen through the frontend UI
- backend services remain internal behind the API layer
- database is the single source of truth
- exports are communication outputs, not governance records
- AI is advisory and manually reviewed

## Internal-use doctrine

This is an internal operations system for delivering accreditation services more effectively.
Clients do not log into this application.
Clients receive outputs generated and verified by the internal team.

## Suggested initial technical direction

- Backend: Django + Django REST Framework
- Frontend: keep current Streamlit bridge temporarily or migrate later to a stronger frontend
- API contract: OpenAPI-first
- AI mode: manual AI assistance first, automated AI integration later only if clearly justified
