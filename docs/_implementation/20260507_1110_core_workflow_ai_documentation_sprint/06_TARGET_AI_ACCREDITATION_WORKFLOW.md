# 06 — Target AI Accreditation Completion Workflow

## Will this help the final objective?
Yes — this defines the target workflow for AI-generated documentation while keeping the system of record governed by humans and project evidence lifecycle.

## Ideal end-to-end workflow (target)
1. **Framework is created/imported** (CSV template → validated import → stored).
2. **Indicators are stored at framework level** (reusable checklist requirements).
3. **AI classifies indicators** (evidence type, document type, action required, cadence, assistance level, etc.).
4. **AI identifies evidence requirements** (what evidence is required to satisfy the indicator).
5. **AI suggests document type(s)** needed (SOP/policy/checklist/register/evidence plan/gap plan).
6. **AI suggests whether new documentation is needed** vs. evidence reuse policy/templating.
7. **User generates documentation drafts** at different scopes:
   - single indicator,
   - selected indicators,
   - area/standard/domain category,
   - full framework.
8. **AI draft is saved** (always as an advisory draft object).
9. **Draft is clearly labeled**: “AI-generated draft — requires human review”.
10. **Draft requires human review** before any promotion.
11. **Draft may be promoted to project evidence only through governed workflow** (RBAC + audit + approval).
12. **Project indicator status updates through official lifecycle only** (service-layer transitions; no direct AI mutation).
13. **Final readiness/inspection pack can be assembled** from approved evidence and governed exports.

## Layer separation (system boundaries)

| Layer | Purpose |
|---|---|
| Framework | Reusable checklist/template for an accreditation standard |
| Framework Indicator | Standard requirement statement + classification metadata |
| Project | Client/institution accreditation cycle instance |
| Project Indicator | Working operational item for a project (status, owners, due dates, readiness) |
| AI Draft | Advisory generated draft content, not evidence |
| Evidence | Project-specific proof (file/link/text) attached to project indicators |
| Final Pack | Inspection-ready compilation (print pack/export bundle) |

## Non-negotiable safety rules
- AI must **never directly mark evidence complete**.
- AI must **never bypass review/approval**.
- AI must **never become the system of record**.
- Promotion from AI draft → evidence must be **explicit**, **governed**, and **audited**.
- ProjectIndicator workflow status/flags must be mutated only via **service layer** and guarded transitions.

## Practical UX expectations
- Framework documentation generation is **opt-in** and **scoped**.
- Every AI output is clearly labeled as a **draft**.
- UI provides operator-friendly guidance and empty states.
- Errors (missing AI key/provider failure) are clear and do not corrupt evidence/workflow state.

