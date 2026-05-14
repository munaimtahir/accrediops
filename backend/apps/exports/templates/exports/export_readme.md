# Exported Inspection Pack for Project "{{ project.name }}"

## Overview
This ZIP archive contains the final inspection pack for the project "{{ project.name }}", generated on {{ bundle.project_summary.date_generated }}.

## Contents
The archive is organized into folders based on the project's framework structure (Area / Standard / Indicator). Each indicator folder contains:
- `approved_evidence/`: Approved evidence files (uploads, text notes, external links).
- `generated_documents/`: AI-generated and promoted documents.
- `physical_references/`: References for physical evidence.
- `requirement_summary.md`: A summary of the indicator's requirements.

### Consolidated Reports:
- `00_Control_Dashboard/readiness_summary.md`: Overall project readiness and export eligibility.
- `90_Gaps_and_CAPA/capa_summary.md`: Summary of all CAPA records.
- `90_Gaps_and_CAPA/capa_report.csv`: Detailed report of CAPA records.
- `90_Gaps_and_CAPA/pending_gaps.csv`: Report of open/pending gaps.
- `91_Missing_Evidence/missing_evidence_report.csv`: Report of missing required evidence.
- `99_Export_Metadata/export_manifest.json`: Machine-readable metadata about this export.

## Important Notes:
- **Export Eligibility:** This pack was generated with an eligibility status of **{{ bundle.project_summary.export_eligibility.eligible }}**. If not eligible, please review the `readiness_summary.md` for reasons.
- **CAPA Status:** Refer to the `90_Gaps_and_CAPA` folder for current CAPA status and reports. Open CAPAs on mandatory requirements or high-risk items may indicate remaining non-conformities.
- **Physical Evidence:** Physical evidence items are listed in the respective `physical_references` folders and in the `physical_evidence_checklist.md`. Their actual files are not included in this digital export.
- **AI-Generated Content:** Only AI-generated documents that have been promoted to evidence are included. Advisory drafts are not part of this final pack.

---
_For any discrepancies or further details, please refer to the live AccrediOps dashboard._
