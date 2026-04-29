# 13 Coverage delta

## Baseline truth (before this sprint)

- Authenticated Playwright coverage existed but was partial across core operational workflows.
- Known gaps included worklist depth, indicator detail paths, evidence/recurring lifecycle continuity, role-gated admin/readiness/export routes, and regression-signal capture.

## Current state

- New deterministic suite map `00..15` implemented under `frontend/tests/e2e/`.
- Coverage now includes:
  - runtime/auth/session shell stability
  - LAB integrity and 119 indicator assertion
  - role-specific create/gating behavior
  - worklist show-all regression path
  - indicator/evidence/review/recurring/AI lifecycle checks
  - readiness/inspection/export/clone/admin surfaces
  - role visibility + restricted-route UX
  - centralized 5xx/console/pageerror/requestfailed regression monitoring
  - clean-app smoke path

## Net effect

- Coverage changed from partial targeted checks to a full authenticated operator-oriented regression suite with deterministic seeded foundations.
