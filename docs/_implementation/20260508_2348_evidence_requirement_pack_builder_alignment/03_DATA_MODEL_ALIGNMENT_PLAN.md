# 03 — Data Model Alignment Plan

## New framework-level model
### EvidenceRequirement
Linked to `Indicator` (framework indicator).

Planned fields:
- `indicator` (FK)
- `title`, `description`
- `evidence_category` (aligned to `EvidenceTypeChoices`)
- `artifact_type` (string)
- `mandatory` (bool)
- `ai_generatable` (bool)
- `physical_proof_required` (bool)
- `signature_required` (bool)
- `ongoing_record_required` (bool)
- `default_document_type` (aligned to `DocumentTypeChoices`)
- `primary_action_required` (aligned to `PrimaryActionRequiredChoices`)
- `display_order`, `is_active`
- timestamps

## New project-level model
### ProjectEvidenceRequirement
Requirement fulfillment row per project indicator + evidence requirement.

Planned fields:
- `project`, `project_indicator`, `framework_indicator`, `evidence_requirement` (FKs)
- `status` (`missing|partial|complete|submitted|approved|rejected|not_applicable`)
- `assigned_to` (optional)
- `due_date` (optional)
- `notes`, `gap_summary`, `review_notes`
- review/approval actors and timestamps
- timestamps

## Linkage extensions
- `EvidenceItem`: optional FK to `ProjectEvidenceRequirement`.
- `DocumentDraft`: optional FK to `ProjectEvidenceRequirement`.

## Backward compatibility
- Existing indicator-level evidence and drafting remains valid.
- Requirement linkage is additive and optional for old records.

