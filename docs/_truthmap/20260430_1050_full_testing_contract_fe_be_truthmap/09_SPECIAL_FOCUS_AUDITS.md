# Special Focus Audits

## A. AI Action Center
- **Sidebar Exposure:** Present in the main layout (`sidebar.tsx`).
- **Indicator Detail Exposure:** Correctly integrated as a panel (`?panel=ai`).
- **Backend API Linkage:** Wired to `/api/ai/` endpoints.
- **Role Visibility:** Only visible to users with `AI_ASSIST_VIEW` capability.
- **E2E Coverage:** Missing. Tests cannot run due to frontend build failure.
- **Status:** **Partially working.** Frontend type errors exist in the generation queue screen.

## B. AI Classification
- **Framework-level Page:** Exists (`admin-frameworks-screen.tsx`).
- **Persistence:** Saved fields are used, but filters incorrectly attempt live calls in some edge cases.
- **Review/Edit/Approve Flow:** Functional. Users can override AI suggestions.
- **RBAC:** Correctly restricted to Admins.
- **Status:** **Verified working, but needs filter fix.**

## C. Document Draft and Evidence Promotion
- **Generate Draft UI:** Exists and is wired to the backend.
- **Draft Review UI:** Exists (`admin-document-generation-queue-screen.tsx`), but is currently failing Next.js build due to strict TypeScript checks (`Type error: Conversion of type 'Record<string, unknown>[]' to type 'DocumentDraft[]'`).
- **Promote to Evidence:** Backend logic is present (`promote_draft_to_evidence` service), but frontend testing is blocked by the build error.
- **Status:** **Broken.** Requires immediate TypeScript fixes.

## D. Framework vs Project Architecture
- **Indicator Ownership:** Indicator lists correctly belong to the Framework level in the database schema.
- **Project Linkage:** Projects correctly link to existing frameworks and clone indicator data into `ProjectIndicator` working records.
- **Separation of Concerns:** Maintained successfully. Projects do not redefine indicator structures.
- **Status:** **Verified working.**

## E. Masters, Settings, RBAC
- **UI Exposure:** Masters (Categories, Types) and Users/Roles are exposed in `/admin/*` routes.
- **Backend Authority:** Backend strictly enforces capabilities.
- **Status:** **Verified working.** 

## F. Lab/FMS Readiness
- **Multiple Frameworks:** System architecture supports multiple frameworks natively.
- **FMS Import:** Backend framework exists, but a dedicated UI for FMS import parsing is missing.
- **Status:** **Backend only.** UI exposure is required for non-engineers to import the Lab/FMS framework.