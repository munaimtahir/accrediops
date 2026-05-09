# 08 — Frontend AI Documentation Implementation

## Will this help the final objective?
Yes — it gives accreditation teams a simple workflow to generate framework-level AI draft documentation, review it, and route it into governed promotion without confusing drafts as evidence.

## What was implemented

### Routes / screens
- `frontend/app/(workbench)/framework-documentation-ai/page.tsx`
  - New workbench route: `/framework-documentation-ai`
- `frontend/components/screens/framework-documentation-ai-screen.tsx`
  - Framework selector
  - Scope selector:
    - Single indicator
    - Selected indicators
    - Area
    - Standard
    - Full framework
  - Document type selector:
    - SOP
    - Policy
    - Checklist
    - Register template
    - Evidence requirement sheet
    - Gap closure plan
  - Generate draft → preview → edit → save
  - Clear badge: “AI-generated draft — requires human review”
  - Link to existing review/promotion page: `/admin/document-drafts/<id>`
  - Recent drafts list for the selected framework

### Navigation
- `frontend/components/layout/sidebar.tsx`
  - Adds sidebar item **Framework Documentation AI** for ADMIN/LEAD roles.

## Backend integration used
- Generate draft:
  - `POST /api/admin/frameworks/<framework_id>/documentation/generate-draft/`
- Save edits:
  - `PATCH /api/admin/document-drafts/<draft_id>/`
- Review/promotion (existing):
  - `/admin/document-drafts/<draft_id>` UI and promote endpoint

## UX safety and messaging
- Explicit warning that drafts are not evidence.
- Promotion guidance routes users into the governed promotion workflow instead of silently creating evidence.
- Access is restricted to ADMIN/LEAD (consistent with admin framework operations).

## Limitations
- The UI uses framework classification data as the indicator picker source; for very large frameworks this may be heavy (a dedicated “indicator picker” endpoint could optimize later).
- This phase did not add new visual design beyond workflow-critical guidance; it focused on clarity and operator usability.

