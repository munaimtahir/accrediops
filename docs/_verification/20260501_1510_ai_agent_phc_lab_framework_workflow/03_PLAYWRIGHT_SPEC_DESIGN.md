# Playwright Spec Design — PHC LAB Full Workflow

Spec file:
- `frontend/tests/e2e/30_phc_lab_framework_full_workflow.spec.ts`

## Design principles
- Prefer real backend/runtime (no route stubbing).
- Prefer role-based selectors: `getByRole`, `getByLabel`, stable placeholders.
- Avoid hard-coded DB IDs.
- Use API helpers for deterministic setup steps (project creation / evidence creation) while still verifying UI screens render correctly.

## Key setup assumptions
- Playwright global setup runs deterministic seeding (`seed_e2e_state`) and creates storage states for:
  - `pw_admin`, `pw_lead`, `pw_owner`, `pw_reviewer`, `pw_approver`
- Base URL points to caddy-proxied app: `http://127.0.0.1:18080`

## Workflow mapping
- Admin test covers: A–J, M, N (core lifecycle + doc generation + draft review + promotion).
- Reviewer test covers: K (basic enforcement + evidence add restriction).
- Approver test covers: L (mark-met action path if readiness is satisfied).

## Known risk areas
- Document generation depends on AI provider configuration; if demo/mock provider not configured, doc generation can fail at runtime.
- Approver mark-met depends on readiness rules (minimum approved evidence); test seeds approved evidence to satisfy.
