# 01 — Current State Baseline

## What exists now

### Core architecture
- Framework hierarchy exists: `Framework -> Area -> Standard -> Indicator`.
- Project runtime exists: `AccreditationProject -> ProjectIndicator`.
- Evidence currently attaches to `ProjectIndicator` via `EvidenceItem`.
- AI drafts exist as `DocumentDraft`, with optional project/project_indicator linkage.
- Readiness, inspection view, and print-pack generation already exist.

### Strong existing capabilities
- Indicator-first workflow and status transitions are enforced in service layer.
- Evidence review model exists (`validity_status`, `completeness_status`, `approval_status`).
- AI drafting and promotion workflow exists and is audit-logged.
- Export eligibility already blocks on readiness constraints.
- Role/capability checks are present for owner/reviewer/approver/admin actions.

## Key missing bridge areas
- No first-class **framework-level Evidence Requirement** model linked to `Indicator`.
- No project-level **requirement fulfillment record** per requirement row.
- Evidence and DocumentDraft cannot currently link to a specific requirement row.
- Required evidence is mainly represented as free text (`required_evidence_description`) + minimum count.
- Readiness/export aggregates are indicator-level, not requirement-row-level.
- No dedicated API surfaces for requirement management and requirement fulfillment lifecycle.

## Architectural drift risks
- Indicator-level-only evidence can overstate readiness without granular requirement traceability.
- AI drafts can be produced/promoted without requirement-row anchoring.
- Inspection packs cannot provide complete requirement-wise compliance matrix.

## Files reviewed (representative)
- `backend/apps/indicators/models/indicator.py`
- `backend/apps/evidence/models/evidence.py`
- `backend/apps/ai_actions/models/document_draft.py`
- `backend/apps/exports/services.py`
- `backend/apps/api/views/evidence.py`
- `backend/apps/api/views/project_indicators.py`
- `backend/apps/api/views/projects.py`
- `backend/apps/api/serializers/project_indicators.py`
- `backend/apps/workflow/permissions.py`
- `frontend/components/screens/indicator-detail-screen.tsx`
- `frontend/lib/hooks/use-evidence.ts`
- `frontend/lib/hooks/use-mutations.ts`
- `frontend/types/index.ts`

