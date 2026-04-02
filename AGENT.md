# AGENT.md

## Mission

Build an internal accreditation operations platform without drifting away from the core product concept.

## Non-negotiable truths

1. The app is for internal company use only.
2. The business sells accreditation services, not software subscriptions.
3. Clients do not use the app directly.
4. The system is indicator-centered, evidence-centered, workflow-aware, and action-oriented.
5. AI is advisory only and must remain under human review.
6. Hard-evidence output and print-pack preparation are essential product outcomes.
7. Reusability across clients is a major strategic value of the product.
8. Recurring evidence maintenance is not optional; it is part of the operational tracker.

## Build style

- Follow contract-first development.
- Do not implement UI or backend behavior that is not represented in the agreed contract.
- Keep frontend actions mapped to explicit application commands.
- Avoid generic “compliance dashboard” shortcuts that weaken evidence workflows.
- Keep terminology aligned with the project documents and locked decisions.
- Do not invent public SaaS, subscription, or client portal behavior.

## Drift prevention

Do not drift into:
- generic task manager
- simple document repository
- reporting-only dashboard
- AI-autonomous compliance decisioning
- client-facing portal
- SaaS subscription product
- pure soft-copy workflow that ignores hard evidence realities

## Preferred implementation pattern

Frontend UI -> API contract layer -> internal service layer -> database

Users must not directly interact with backend services or uncontrolled mutation routes.
