# Test Results

## Commands run

| Command | Result |
|---|---|
| `python3 manage.py check` | passed |
| `python3 manage.py makemigrations --check --dry-run` | passed |
| `python3 manage.py test apps.api.tests.test_governance_hardening apps.api.tests.test_evidence_and_ai` | passed |
| `npm run build` | passed |
| `npx playwright test tests/e2e/13_role_visibility_and_authorization.spec.ts --reporter=list` | passed after compose rebuild |
| `npx playwright test tests/e2e/09_ai_advisory_non_mutation.spec.ts tests/e2e/16_action_visibility_fix.spec.ts --reporter=list` | passed |

## Runtime note

- Initial Playwright failures were caused by the active `accrediops-*` Docker Compose stack still serving older frontend/backend images on `18080`.
- Verification required:
  - local targeted build checks
  - then `docker compose up -d --build backend frontend`
  - then rerunning Playwright against refreshed containers

## Verified user-facing outcomes

- Drawer-to-detail AI discoverability works from the main worklist flow.
- AI generation still does not mutate workflow status.
- Owner now sees restricted UX on print-pack and client-profile routes.
- Lead no longer sees admin-only override execution controls.
