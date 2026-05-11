# Master Data and Policy Seeding

Verify seed command presence, idempotency, and policy decision coverage. Include evidence of repeated runs where safe.

## Code Review Findings

Commands reviewed:

- `backend/apps/masters/management/commands/seed_master_values.py`
  - Uses `MasterValue.objects.update_or_create(...)` for each `(key, code)` pair.
  - Does not delete existing rows (comment mentions deletion as a possibility but is not executed).
  - Source of truth: `apps.masters.choices` `TextChoices` classes ending in `Choices`.
- `backend/apps/masters/management/commands/seed_policies.py`
  - Uses `PolicyDecision.objects.update_or_create(code=..., defaults=...)`.
  - No deletes.

Missing per requested checklist:

- `backend/apps/masters/management/commands/seed_master_data.py`: MISSING under this expected name (no evidence found at that path).

Seeded master domains (observed from command output):

- Evidence types, document types, AI assistance levels, classification review statuses/confidence, evidence frequency values, recurrence frequencies, plus additional evidence metadata domains.

Policy decision coverage (present in `seed_policies.py` list, 13 total):

- AI advisory-only
- AI cannot mutate workflow automatically
- AI does not create final evidence automatically
- human-reviewed classifications protected
- manually changed classifications protected
- project inherits framework
- project does not redefine indicators
- framework upload is framework-level
- evidence promotion requires human action
- bulk approval guardrails (no approve unclassified, low confidence requires review, etc.)

## Commands Executed

Executed on 2026-05-01 against local repo DB (`backend/db.sqlite3`):

- `cd backend && python3 manage.py seed_master_values` (ran twice)
- `cd backend && python3 manage.py seed_policies` (ran twice)
- `cd backend && python3 manage.py shell -c "from apps.masters.models import MasterValue, PolicyDecision; ..."` (counts)

## Idempotency Evidence

- `seed_master_values` uses `update_or_create` for stable keys, so repeated runs should not duplicate rows.
- `seed_policies` second run output: `Seeded 0 new policy decisions. Total policies: 13.`
- Post-run counts:
  - `MasterValue.count 101`
  - `PolicyDecision.count 13`

## Status Classification

- Master value seeding: VERIFIED BY CODE + VERIFIED BY RUNTIME
- Policy decision seeding: VERIFIED BY CODE + VERIFIED BY RUNTIME
- Additional master seed command (`seed_master_data.py`): MISSING (under the expected filename/path)
