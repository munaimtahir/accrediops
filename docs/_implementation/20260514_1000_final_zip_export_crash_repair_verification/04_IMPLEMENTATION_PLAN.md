# Implementation Plan - Final ZIP Export Crash Repair & Verification

## Phase 1: Fix Data Inconsistency in `build_print_bundle`
- Update `build_print_bundle` in `backend/apps/exports/services.py` to include `file_or_url` and `text_content` in the `evidence_list` dictionary.
- Ensure all other fields required by `build_final_zip_export` are present.

## Phase 2: Fix API View Imports and Error Handling
- Update `backend/apps/api/views/exports.py` to import `Response`, `status`, and `PermissionDenied`.
- Use `success_response` where appropriate, or ensure `Response` is used correctly with the standard envelope.

## Phase 3: Enhance `build_final_zip_export` Robustness
- Add null/missing checks for `file_or_url` and other fields in `build_final_zip_export`.
- Ensure filesystem-safe names for folders and files.
- Handle missing files on disk gracefully (already partially implemented with `MISSING_FILE.txt`, but needs verification).

## Phase 4: Verification
- Run backend tests and ensure they pass.
- Verify ZIP contents match expectations (readiness summary, evidence files, CAPA report).
- Verify eligibility blockers work as intended.

## Phase 5: Recurring Workflow Triage
- Run recurring workflow E2E tests.
- Classify failures and apply small, safe fixes where possible.
