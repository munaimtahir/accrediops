# Baseline and Scope - Final ZIP Export Crash Repair & Verification Sprint

## Current Status
- Final ZIP export implementation exists but crashes with 500 Internal Server Error.
- Previous sprint reached Conditional GO but failed to verify ZIP export due to the crash.
- CAPA MVP is integrated into readiness but needs to be correctly reflected in ZIP export.

## Findings from Initial Research
1. **Missing Field in `build_print_bundle`**: The `file_or_url` field (and possibly others like `text_content`) is missing from the `evidence_list` dictionary in `backend/apps/exports/services.py`, causing a `KeyError` in `build_final_zip_export`.
2. **Missing Imports in `ProjectFinalZipExportView`**: The view in `backend/apps/api/views/exports.py` is missing imports for `Response`, `status`, and `PermissionDenied`, causing secondary crashes when an error occurs.
3. **Template Dependencies**: `build_final_zip_export` relies on several templates in `exports/` (e.g., `readiness_summary.md`, `physical_checklist.md`, `pending_gaps.csv`, etc.) which need to be verified.

## Scope
- Fix `KeyError` in `build_final_zip_export` by ensuring all necessary fields are passed in the bundle.
- Fix missing imports and error handling in `ProjectFinalZipExportView`.
- Ensure all required templates exist and work correctly.
- Verify ZIP export for an eligible project.
- Verify blockers work for an ineligible project.
- Triage recurring workflow E2E failures (Secondary).

## Out of Scope
- Redesigning CAPA or Evidence Workflow.
- Advanced CAPA analytics.
- New frontend features unrelated to ZIP export status.
