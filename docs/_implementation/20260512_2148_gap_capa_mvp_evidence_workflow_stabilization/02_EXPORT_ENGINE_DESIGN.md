# Export Engine Design

## 1. Objectives
- Implement a physical ZIP export engine that packages an inspection-ready accreditation pack.
- Consume existing evidence bridge and CAPA MVP data.
- Dynamically generate a folder structure based on framework areas/standards.
- Enforce export eligibility rules.

## 2. Core Service: `build_final_zip_export`
- **Location:** `backend/apps/exports/services.py`
- **Inputs:** `project`, `actor`, `export_type`
- **Outputs:** Path to the generated ZIP file.
- **Key Steps:**
    1.  **Enforce Eligibility:** Calls `enforce_export_eligibility`. If not eligible, raises `PermissionDenied`.
    2.  **Temporary Directory:** Creates a unique temporary directory to stage all export contents.
    3.  **Data Bundle:** Retrieves a comprehensive data bundle using `build_print_bundle(project)`. This includes `project_summary`, `sections` (structured by area/standard/indicator), and `consolidated_lists` (missing evidence, pending CAPA).
    4.  **Control Dashboard (`00_Control_Dashboard`):**
        *   `readiness_summary.md`: Renders a Markdown summary of project readiness, eligibility, and CAPA status.
        *   `master_evidence_index.csv`: Placeholder (to be populated with actual evidence index).
        *   `document_register.csv`: Placeholder (to be populated with document metadata).
        *   `final_submission_index.md`: Placeholder (to be populated with overall submission index).
    5.  **Framework Structure (`01_<Area_Name>/<Standard_Code>_<Standard_Name>/<Indicator_Code>/`):**
        *   Iterates through `bundle["sections"]` to create a hierarchical folder structure.
        *   Each `Indicator_Code` folder contains:
            *   `approved_evidence/`: For approved evidence files (uploads, URLs, text notes).
            *   `generated_documents/`: For AI-generated and promoted documents.
            *   `physical_references/`: For references to physical evidence.
            *   `requirement_summary.md`: Indicator-specific summary.
    6.  **Evidence Copying/Referencing:**
        *   For `UPLOAD` type evidence, copies the actual file from `MEDIA_ROOT`.
        *   For `URL`, `TEXT_NOTE`, `EXTERNAL_REF`, creates text files with content/URLs.
        *   For `GENERATED` evidence (AI drafts), creates Markdown files with draft content.
    7.  **CAPA & Gap Reports (`90_Gaps_and_CAPA`):**
        *   `pending_gaps.csv`: Lists all open/pending gaps.
        *   `capa_report.csv`: Detailed CAPA report.
        *   `capa_summary.md`: Markdown summary of CAPA status.
    8.  **Missing Evidence Report (`91_Missing_Evidence`):**
        *   `missing_evidence_report.csv`: Details missing mandatory evidence.
    9.  **Export Metadata (`99_Export_Metadata`):**
        *   `export_manifest.json`: Machine-readable JSON manifest of the export.
        *   `export_readme.md`: Human-readable README for the ZIP.
    10. **ZIP Creation:** Uses `zipfile` to create a compressed archive of the staged contents.
    11. **Cleanup:** Removes the temporary staging directory.
    12. **Audit Log:** Logs an audit event for the ZIP generation.
    13. **Return:** Returns the `Path` object of the generated ZIP file.

## 3. API Endpoint: `ProjectFinalZipExportView`
- **Location:** `backend/apps/api/views/exports.py`
- **Method:** `POST` to `/api/projects/{id}/exports/final-zip/`
- **Permissions:** Requires `AdminOrLeadPermission`.
- **Behavior:**
    1.  Calls `build_final_zip_export` service.
    2.  Returns a `success_response` with `file_url` for download (assuming `MEDIA_URL` configuration).
    3.  Includes error handling for `PermissionDenied` (eligibility check) and generic `Exception` (server errors).

## 4. Frontend Integration (Minimal)
- **Location:** `frontend/components/screens/project-print-pack-screen.tsx`
- **Action:** Added a "Final ZIP Export" button.
- **Logic:** The button is enabled only when `exportReady` (determined by `export_eligibility_report`). On click, it triggers a `useMutation` hook (`useTriggerZipExport`) that calls the new API endpoint and initiates a file download.

## 5. CAPA-Aware Export Requirements
- The export engine fully consumes the existing CAPA MVP data (pending Gaps, open CAPAs, high-risk CAPAs, overdue CAPAs).
- `capa_blockers` are explicitly checked by `export_eligibility_report` to block final ZIP export.
- CAPA reports (`capa_report.csv`, `capa_summary.md`) are generated within the ZIP.
- Placeholder CAPA data is no longer used; actual CAPA MVP data is utilized.
