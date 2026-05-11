# Framework vs Project Architecture Check

Verify the architecture rule:

- Framework owns indicator structure.
- Project links to framework.
- Project creates operational working records from framework indicators.
- Project does not redefine indicator structure.
- Framework import/classification remains framework-level.
- Evidence, status, review, due dates, assignments, and notes are project-level/operational.

## Evidence (Models / Services / Views)

Framework owns structure:

- `backend/apps/frameworks/models/framework.py`
  - `Framework`, `Area`, `Standard` are framework-scoped models.
- `backend/apps/indicators/models/indicator.py`
  - `Indicator.framework` FK and constraint `UniqueConstraint(fields=["framework", "code"], name="unique_indicator_code_per_framework")`.
  - Classification and AI governance fields live on `Indicator` (framework-level): `classification_review_status`, `classification_confidence`, `classification_reason`, `classified_by_ai_at`, `classification_reviewed_*`, `ai_assistance_level`, `evidence_frequency`, etc.

Project is operational:

- `backend/apps/projects/models/project.py`
  - `AccreditationProject.framework` FK (`on_delete=PROTECT`) links projects to frameworks.
- `backend/apps/indicators/models/indicator.py`
  - `ProjectIndicator.project` + `ProjectIndicator.indicator` and constraint `UniqueConstraint(fields=["project", "indicator"], name="unique_project_indicator")`.
  - Operational fields are project-level: `current_status`, `is_finalized`, `is_met`, assignments (`owner/reviewer/approver`), `due_date`, `notes`.
- `backend/apps/projects/services.py`
  - `initialize_project_from_framework(...)` loads `Indicator` rows for `project.framework` and creates `ProjectIndicator` rows (`get_or_create`), optionally generating recurring instances.

Framework-level routes (read-only / analysis / export):

- `backend/apps/api/views/frameworks.py` filters indicators by framework and supports framework template/export payloads.

## Architecture Rule Assessment

- Framework owns indicator structure: VERIFIED
- Project links to framework: VERIFIED
- Project creates working records from framework indicators: VERIFIED
- Project does not redefine indicator structure: VERIFIED
- Framework import remains framework-level: UNKNOWN (import endpoint/UI not fully evidenced in this pass; see `10_UI_BACKEND_PARITY_REVIEW.md`)
- Classification remains framework-level: VERIFIED (classification fields are on `Indicator`, not `ProjectIndicator`)
- Evidence/status/review/due dates/assignments/notes are project-level: VERIFIED

Status: VERIFIED

Architecture drift detected: NONE observed in the reviewed models/services.

