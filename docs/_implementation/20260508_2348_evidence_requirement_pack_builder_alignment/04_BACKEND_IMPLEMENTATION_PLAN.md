# 04 — Backend Implementation Plan

## Models and migrations
1. Add `EvidenceRequirement` in `apps.indicators.models`.
2. Add `ProjectEvidenceRequirement` in `apps.indicators.models`.
3. Add optional relation fields:
   - `EvidenceItem.project_evidence_requirement`
   - `DocumentDraft.project_evidence_requirement`
4. Add migrations across `indicators`, `evidence`, `ai_actions`.

## Services
1. Initialize project requirement rows in project initialization service.
2. Add requirement fulfillment update/submit/approve/reject service functions.
3. Extend evidence and draft services to validate and attach requirement links.
4. Add requirement-level readiness summary helper for API/export use.

## API
1. Framework-level requirement CRUD endpoints.
2. Project-level requirement list/update/submit/approve/reject endpoints.
3. Include requirement data in indicator detail serializer context/payload.
4. Update URL routing.

## Permissions and audit
- Use existing role checks with action-specific enforcement.
- Add audit events for requirement CRUD and fulfillment lifecycle events.

