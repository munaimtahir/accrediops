# 08 — Test Plan

## Backend
- EvidenceRequirement creation and indicator linkage.
- ProjectEvidenceRequirement initialization on project setup.
- Fulfillment status transitions and approval/rejection rules.
- EvidenceItem and DocumentDraft requirement linkage behavior.
- Readiness impact from missing mandatory requirements.

## API
- Requirement CRUD (framework-level).
- Project requirement list/update/submit/approve/reject.
- Requirement-level readiness summary.

## Frontend
- Requirement rows render in indicator required evidence panel.
- Evidence form can link to requirement.
- Requirement status updates reflected in UI.

## E2E (targeted)
- Initialize project -> requirement rows exist.
- Link one generated draft + one uploaded evidence to requirements.
- Leave one mandatory requirement missing.
- Verify readiness not 100% and preview surfaces missing requirement.

