# Seed Data and Preconditions — PHC LAB

## Preconditions checklist

1. PHC LAB framework exists: Yes (`_discovery_backend_stats.txt`)
2. PHC LAB has indicators: Yes (118)
3. Admin user exists: Yes (`admin`, `pw_admin`)
4. Lead user exists: Yes (`pw_lead`)
5. Owner user exists: Yes (`pw_owner`)
6. Reviewer user exists: Yes (`pw_reviewer`)
7. Approver user exists: Yes (`pw_approver`)
8. At least one indicator eligible for document generation: **Not by default** (initial query showed 0 with `primary_action_required=GENERATE_DOCUMENT`).
   - Approach: Set one indicator classification to `primary_action_required=GENERATE_DOCUMENT` during the Playwright workflow via real admin endpoints (no route stubs).
9. At least one indicator suitable for manual evidence: Yes (any project indicator accepts manual evidence via `/api/evidence/`).
10. At least one recurring indicator (if recurring workflow is present): Yes (44).

## Seed commands used
- `python manage.py seed_master_values`
- `python manage.py seed_policies`
- `python manage.py seed_e2e_state --password x --clean-e2e-records --ensure-client --ensure-project --initialize-project`

Notes:
- `seed_e2e_state` is used by Playwright global setup and is intended to create deterministic users + baseline project.
- In this sprint, `seed_e2e_state` was adjusted to:
  - target framework name `PHC LAB`
  - avoid deleting frameworks/indicators when cleaning records

## Determinism strategy for this sprint
- Use deterministic users (`pw_*`) from seed.
- Create a project with a timestamped name prefixed with `E2E` so it can be safely cleaned in later runs.
- Use real backend endpoints for classification, draft generation, promotion, and evidence.
