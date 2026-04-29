# 01 — Scope and Objective

## Objective
Prepare AccrediOps as a production-ready release candidate by completing data cleanup, auth/domain hardening, security/config hardening, verification, and release decisioning.

## In scope
- Production-safe cleanup of test/demo/seed operational data.
- Auth/session/domain/proxy repair and revalidation on `https://phc.alshifalab.pk`.
- Runtime hardening for Django/Next/Caddy alignment.
- Build/test/e2e/live-smoke verification.
- Evidence-backed release decision.

## Out of scope
- Core workflow redesign.
- Feature behavior changes not required for production safety/alignment.

## Success criteria
- No production-visible fake/test/demo operational data.
- Live login/session/logout works on PHC domain without auth/session 400 failures.
- Core build/test/e2e layers pass.
- Deployment/runtime truth is documented and consistent.
- Final GO/NO-GO verdict is evidence-backed.
