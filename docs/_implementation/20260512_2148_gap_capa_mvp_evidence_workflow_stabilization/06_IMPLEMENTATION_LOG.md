# Implementation Log

## Models Added
- **`Gap`**: Represents a deficiency identified from missing/partial/rejected evidence or manual identification. Linked to `Project`, `ProjectIndicator`, `EvidenceRequirement`, and `ProjectEvidenceRequirement`.
- **`CAPA`**: Represents Corrective and Preventive Actions linked to a `Gap` and `Project`. Supports workflow states (OPEN -> IN_PROGRESS -> SUBMITTED_FOR_REVIEW -> CLOSED/REJECTED).

## Migrations Added
- `backend/apps/indicators/migrations/0006_gap_capa.py` added to apply Gap and CAPA to the database schema.

## Services Added
- Added `backend/apps/indicators/capa_services.py` to contain:
  - `create_gap_from_project_evidence_requirement`
  - `create_manual_gap`
  - `create_capa_from_gap`
  - `update_capa`
  - `submit_capa_for_review`
  - `close_capa`
  - `reject_capa`
  - `calculate_project_capa_summary`
  - `list_open_capa_for_project`

## API Endpoints Added
- Added serializers in `backend/apps/api/serializers/capa.py`.
- Added views in `backend/apps/api/views/capa.py` to support listing, creating, and updating Gaps and CAPAs.
- Added API routes to `urls.py`.

## Bug Fixes
- `ProjectEvidenceRequirementDetailView.perform_update` now correctly explicitly calls `serializer.save()`, while `ProjectEvidenceRequirementUpdateSerializer.update()` overrides it to execute the business logic (`update_project_evidence_requirement`), preserving `refresh_from_db` functionality and standard DRF persistence handling, resolving the `MISSING` state bug in E2E.

## Readiness Integration
- Updated `calculate_project_evidence_readiness` in `evidence/services.py` to count CAPA blockers, high-risk CAPAs, and integrate CAPA counts.
- `project_readiness` updated to report CAPA statistics to the frontend.

## Frontend Updates
- Updated `indicator-detail-screen.tsx` to display `ProjectEvidenceRequirement` rows with GAP and CAPA badges.
- Updated `project-readiness-screen.tsx` to add a new "Gap & CAPA Status" section.
- Updated `project-print-pack-screen.tsx` to parse `capa_blockers` from the readiness report, effectively blocking export when HIGH/CRITICAL CAPAs are open, and printing the `pending_capa` list in the output.

## Decisions Made
- Added Gap and CAPA to `apps.indicators` to closely associate them with `ProjectEvidenceRequirement` and `ProjectIndicator` models.
- AI was strictly defined as advisory through documentation.
