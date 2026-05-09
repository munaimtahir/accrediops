# 00 — Objective Fit Check

## Will this help the final objective?
Yes.

## Final objective (plain English)
Build an AI-based accreditation dashboard that helps a team take an accreditation standards framework (checklist) and complete accreditation requirements end-to-end: create/import frameworks, manage indicators, classify indicators, identify evidence, plan gaps/actions, generate draft documents (SOPs/policies/etc.), review/approve drafts, promote approved drafts into project evidence, track evidence completion per project, and assemble a final inspection/readiness pack.

## Why notifications are delayed
Notifications (including WebSockets) are helpful for later operational scale but are not required to perfect the primary accreditation workflow. They add complexity and cross-cutting concerns (delivery, preferences, noise, audit) that distract from stabilizing the core workflow and AI drafting safety rules.

## Why this sprint is focused on the following
- **Core workflow reliability**: The product must reliably support framework → project → indicator → evidence → review → pack, because this is the accreditation team's primary path to completion.
- **Meaningful test coverage**: Critical business rules (RBAC, lifecycle transitions, evidence attachment, governed promotion) must be strongly tested to prevent regressions as AI workflows are added.
- **Playwright cleanup**: Core browser journeys must be protected with stable E2E coverage so teams can actually use the workflow day-to-day.
- **AI documentation generation**: AI-generated drafts (advisory only) accelerate accreditation completion by producing structured SOPs/policies/checklists/registers/evidence plans.
- **Evidence workflow enforcement**: AI output must not become the system of record; drafts must require human review and governed promotion to evidence.

## Explicitly out of scope (this sprint)
- Notifications
- WebSockets / realtime
- Major redesigns or navigation overhaul
- New analytics unrelated to evidence completion/readiness
- Cosmetic-only UI changes
- Production deployment/hardening (unless strictly needed to verify the current workflow)

