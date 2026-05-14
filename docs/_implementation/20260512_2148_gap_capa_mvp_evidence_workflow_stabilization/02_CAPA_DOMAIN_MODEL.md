# CAPA Domain Model

This document outlines the models introduced for the CAPA (Corrective and Preventive Action) functionality.

## Application Placement
We chose to place the `Gap` and `CAPA` models in the existing `apps.indicators` application. This aligns with the existing architecture where `ProjectEvidenceRequirement` and `ProjectIndicator` are located, creating a tight, localized reference chain without creating a sparsely populated new app.

## Data Models

### Gap Model
The `Gap` model tracks issues found during accreditation.

**Fields:**
- `project`: FK to `projects.AccreditationProject`
- `project_indicator`: FK to `indicators.ProjectIndicator`
- `project_evidence_requirement`: Nullable FK to `indicators.ProjectEvidenceRequirement`
- `evidence_requirement`: Nullable FK to `indicators.EvidenceRequirement`
- `title`: `CharField`
- `description`: `TextField`
- `severity`: `CharField` using `PriorityChoices` (LOW, MEDIUM, HIGH, CRITICAL)
- `source`: `CharField` using `GapSourceChoices` (MISSING_EVIDENCE, PARTIAL_EVIDENCE, REJECTED_EVIDENCE, MANUAL, MOCK_INSPECTION, AI_SUGGESTED)
- `status`: `CharField` using `GapStatusChoices` (OPEN, LINKED_TO_CAPA, RESOLVED, DISMISSED)
- `created_by`, `created_at`, `updated_at`: Auditing fields.

### CAPA Model
The `CAPA` model tracks the plan and resolution of a gap.

**Fields:**
- `project`: FK to `projects.AccreditationProject`
- `gap`: FK to `Gap`
- `project_indicator`: FK to `indicators.ProjectIndicator`
- `project_evidence_requirement`: Nullable FK to `indicators.ProjectEvidenceRequirement`
- `title`: `CharField`
- `root_cause`: `TextField`
- `corrective_action`: `TextField`
- `preventive_action`: `TextField`
- `responsible_person`: FK to User
- `due_date`: `DateField`
- `status`: `CharField` using `CapaStatusChoices` (OPEN, IN_PROGRESS, SUBMITTED_FOR_REVIEW, CLOSED, REJECTED, CANCELLED)
- `closure_notes`: `TextField`
- `closure_evidence`: Nullable FK to `evidence.EvidenceItem`
- `submitted_by`, `submitted_at`, `reviewed_by`, `reviewed_at`, `closed_by`, `closed_at`, `rejection_reason`: Workflow fields.
- `created_by`, `created_at`, `updated_at`: Auditing fields.

## Status Enums Added to `apps.masters.choices`
- `GapSourceChoices`
- `GapStatusChoices`
- `CapaStatusChoices`

The migration was applied successfully.
