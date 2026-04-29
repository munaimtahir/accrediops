# Agent Handoff Context

## What the app is
AccrediOps: An internal accreditation operations platform for managing, tracking, and completing accreditation readiness (Frameworks, Projects, Indicators, Evidence).

## Current Stack
- Django 5.2 / DRF 3.16 backend
- Next.js 15 App Router frontend (Tailwind)
- SQLite locally, Caddy proxy

## Current Status
**Strong MVP.** Essential features are complete. Workflow and state transitions are robustly implemented and permission-guarded.

## Confirmed Working Features
- Dashboard metrics and worklists
- Project initialization from framework templates
- Indicator state transitions (Draft -> Review -> Met)
- AI Generated Outputs (advisory mode)
- Print Pack / Excel exports
- Role-based UI visibility

## Confirmed Missing Features
- Explicit Lab/FMS specific standard models (if they differ from generic frameworks)
- Cloud file storage (S3) for physical evidence uploads
- Automated notifications (Email/WhatsApp)

## Exact Files to Inspect First
- `backend/apps/indicators/models/indicator.py` (Core domain)
- `backend/apps/api/views/project_indicators.py` (Core API workflow)
- `frontend/components/forms/working-state-form.tsx` (UI workflow)
- `docker-compose.yml` (Infra)

## Recommended First Task
Clarify the FMS/Lab standards mapping. If it just uses `Framework` models, import the data. If it needs distinct tables, build the `fms` Django app. Second task: Configure production storage/database.

## Guardrails
- **Do not break the `workflow_transition_is_allowed` logic.** State changes must happen via explicit API views, not raw PUTs to the detail view.
- **AI is advisory only.** Do not map AI directly to indicator status completion.
