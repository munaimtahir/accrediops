# Phase 0 — Objective Fit Check

Will this sprint help the final objective?

**Answer: YES.**

## 1) Final objective (plain English)
Build an AI-based accreditation dashboard that imports/creates a standards framework, manages framework indicators, uses AI to classify and draft documentation, supports governed review/approval, promotes approved drafts into project evidence, tracks evidence status, and produces inspection-ready outputs.

## 2) Why this sprint helps the final objective
The core accreditation journey must be protected at the browser-workflow level to prevent regressions. This sprint focuses on stabilizing Playwright E2E for:
- Framework → project initialization
- Indicator worklist/detail
- Evidence submission and governed status transitions
- Review/approval flows
- AI documentation draft generation (advisory-only) and governed promotion
- Export/readiness surfaces (where implemented)

Reliable E2E coverage is required to safely iterate on accreditation workflow features and to ensure RBAC and governance rules remain enforced.

## 3) Why notifications remain delayed
Notifications are valuable but non-essential to validating the primary workflow. They add cross-cutting complexity (events, delivery, preference management, async jobs) and will be scheduled after the core journey is reliable and protected by tests.

## 4) Why production deployment remains delayed
Production hardening (Gunicorn, Postgres, container hardening, secrets, observability) is intentionally deferred. The priority is workflow correctness and governance. Deployment work will follow once E2E reliability is strong and the main journeys are stable.

## 5) Out of scope
- Notifications
- WebSockets
- Production Docker hardening / Postgres migration / Gunicorn
- New AI features beyond stabilizing existing AI documentation workflow
- New analytics dashboards unrelated to evidence completion
- Major UI redesign
- Cosmetic-only changes
