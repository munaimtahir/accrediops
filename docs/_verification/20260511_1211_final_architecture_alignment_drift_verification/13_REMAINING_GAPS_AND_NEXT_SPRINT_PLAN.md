# Remaining Gaps and Next Sprint Plan

## A. Must Fix Before Feature Expansion

- Replace placeholder export eligibility logic with real readiness data.
- Resolve the duplicate `EvidenceRequirementSuggestion` model and its migration drift.
- Fix the inspection-view `500`.
- Fix the print-pack/export `403` for projects that are otherwise export-ready.

## B. Should Fix Soon

- Add a visible requirement-row fulfillment matrix in the frontend.
- Make readiness and inspection screens show requirement-level counts more directly.
- Harden backend tests around export and inspection routes.

## C. Can Defer

- Richer CAPA modeling beyond the current placeholder behavior.
- Final ZIP archive engine, if the team is still using preview-based export during active development.

## D. Nice to Have

- More explicit physical-evidence reporting views.
- More detailed export register formatting.
- Additional UX polish for non-technical accreditation users.

## Recommended Next Sprint

**Evidence Bridge Test Hardening Sprint**

Why this sprint is next:

- The core bridge is present, but its most important verification surfaces are still failing or blocked.
- Fixing tests around readiness, inspection, and export will prove that the architecture is stable before more UI or export expansion.

Scope:

- fix the inspection view failure
- fix export gating to rely on real readiness
- remove the duplicate suggestion-model drift
- add or repair targeted bridge tests

Acceptance criteria:

- `manage.py makemigrations --check --dry-run` is clean
- targeted bridge tests pass
- `print-bundle` no longer blocks ready projects incorrectly
- inspection view returns `200`
- no new feature surface is added

Tests required:

- backend targeted evidence-bridge tests
- backend export/readiness tests
- backend inspection tests

Likely files involved:

- `backend/apps/exports/services.py`
- `backend/apps/exports/services_admin.py`
- `backend/apps/api/views/exports.py`
- `backend/apps/api/views/projects.py`
- `backend/apps/ai_actions/models/`
- `backend/apps/indicators/models/`
- `backend/apps/api/tests/*`

What not to include:

- no new CAPA UI
- no final ZIP export engine
- no broad frontend redesign
- no database redesign

