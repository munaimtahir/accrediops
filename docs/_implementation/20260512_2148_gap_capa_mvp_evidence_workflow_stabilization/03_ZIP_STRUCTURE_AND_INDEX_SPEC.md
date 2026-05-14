# ZIP Structure and Index Specification

This document details the planned directory structure and content of the final ZIP export.

## 1. Top-Level Directory
- `Final_Inspection_Pack/`: The root directory of the ZIP archive, named after the project (e.g., `Project_Alpha_Health-final-inspection-pack-202605122148.zip`).

## 2. Control Dashboard (`00_Control_Dashboard/`)
- Contains global summaries and indexes.
    - `readiness_summary.md`: Markdown summary of overall project readiness, export eligibility, and CAPA status.
    - `master_evidence_index.csv`: CSV index of all approved evidence files, their linked indicators, and locations within the ZIP.
    - `document_register.csv`: CSV index of all generated/promoted documents.
    - `final_submission_index.md`: Markdown overview of the entire submitted pack.

## 3. Framework Area/Standard/Indicator Structure
- Dynamically generated based on the project's framework.
- Example: `01_AAC_AccessAssessmentandContinuityofCare/` (Area)
    - `AAC.1_Servicesareaccessibleto.../` (Standard)
        - `IND-001/` (Indicator)
            - `approved_evidence/`: Approved evidence files.
                - Digital files (e.g., `evidence_123_policy.pdf`).
                - Text files for external links/text notes (e.g., `evidence_456_link.txt`).
            - `generated_documents/`: AI-generated and promoted documents.
                - `draft_789_report.md`
            - `physical_references/`: References/checklists for physical evidence.
                - `physical_evidence_checklist.md`: Markdown checklist for physical items.
            - `requirement_summary.md`: Markdown summary for the specific indicator.

## 4. CAPA and Gaps Reports (`90_Gaps_and_CAPA/`)
- Contains reports related to deficiencies and corrective actions.
    - `pending_gaps.csv`: CSV report of all open/pending gaps.
    - `capa_report.csv`: CSV report of all CAPA records (open, closed, rejected).
    - `capa_summary.md`: Markdown summary of CAPA status and key open items.

## 5. Missing Evidence Report (`91_Missing_Evidence/`)
- Contains reports of critical missing items.
    - `missing_evidence_report.csv`: CSV report of all mandatory evidence that is still missing or rejected.

## 6. Physical Evidence Checklist (`92_Physical_Evidence_Checklist/`)
- Contains an aggregated list of all physical evidence items that need manual verification.
    - `physical_evidence_checklist.csv`: CSV checklist of physical evidence.

## 7. Export Metadata (`99_Export_Metadata/`)
- Contains metadata about the export itself.
    - `export_manifest.json`: Machine-readable JSON manifest including project details, generation date, eligibility report, and a summary of contents.
    - `export_readme.md`: Human-readable Markdown file explaining the contents and structure of the ZIP archive.

## File Naming Conventions
- All folder and file names will be made filesystem-safe (alphanumeric, underscores).
- IDs will be incorporated to ensure uniqueness.

## Indexing
- The various CSV and Markdown files within the `00_Control_Dashboard/` section serve as cross-references and aggregated indexes for the entire pack.
