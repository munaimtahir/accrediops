# 00 — Objective Fit Check

## Will this sprint help the final objective?
YES.

## Final objective (plain English)
Build an AI-based accreditation dashboard that turns a standards framework into an end-to-end accreditation completion workflow: import frameworks, manage indicators, classify with AI, generate advisory documentation drafts, track evidence, run review/approval, and assemble inspection readiness outputs.

## Why this sprint helps the final objective
The AI documentation workflow is implemented and usable, but browser-level reliability is not yet strong enough to prevent regressions across the core accreditation journey. Stabilizing Playwright E2E protects the primary workflow (framework → project → evidence → review/approval → export/print pack) so future improvements can be delivered safely.

## Why notifications remain delayed
Notifications are helpful later, but they are not required to complete accreditation requirements. Reliability and correctness of the core workflow are higher priority.

## Why production deployment remains delayed
Production hardening is intentionally deferred until the core workflow and E2E regression gate are stable. This sprint uses Docker as a local verification harness only.

## Out of scope
- Notifications
- WebSockets
- Production Docker hardening (Gunicorn/Postgres/CI deploy)
- New AI features (beyond keeping AI Documentation E2E green)
- New dashboard analytics
- Major UI redesign / cosmetic-only changes

