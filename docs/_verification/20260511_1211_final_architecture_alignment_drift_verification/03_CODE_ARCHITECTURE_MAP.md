# Code Architecture Map

## Backend Modules

| Area | File(s) | Purpose | Status | Notes |
|---|---|---|---|---|
| Framework core | `backend/apps/frameworks/models/framework.py` | Framework definition and reusable areas/standards | PASS | Framework remains separate from project data. |
| Indicator models | `backend/apps/indicators/models/indicator.py` | `Indicator`, `EvidenceRequirement`, `ProjectIndicator`, `ProjectEvidenceRequirement`, `EvidenceRequirementSuggestion` | PASS | Central bridge models exist here. |
| Evidence items | `backend/apps/evidence/models/evidence.py` | Uploaded/generated evidence records | PASS | `EvidenceItem` links to `ProjectEvidenceRequirement`. |
| AI drafting | `backend/apps/ai_actions/models/document_draft.py`, `backend/apps/ai_actions/services/document_drafting.py` | Draft generation and promotion to evidence | PASS | Drafts stay advisory and can be promoted under control. |
| AI classification | `backend/apps/ai_actions/services/classification.py` | Advisory classification and suggestions | PASS | AI suggestions remain separate from approved records. |
| Project initialization | `backend/apps/projects/services.py` | Project setup and indicator seeding | PASS | Initializes project indicators and requirement rows. |
| Evidence workflow | `backend/apps/indicators/services.py`, `backend/apps/evidence/services.py` | Requirement lifecycle, review, approval, rejection, evidence creation | PASS | Requirement-level workflow exists. |
| API routes | `backend/apps/api/urls.py` | REST surface for framework, project, evidence, export, readiness | PASS | Routes exist for the bridge and export surfaces. |
| API indicator views | `backend/apps/api/views/indicator.py`, `backend/apps/api/views/project_indicators.py` | Framework requirement CRUD and project fulfillment updates | PASS | Requirement and fulfillment endpoints are present. |
| Evidence/API review | `backend/apps/api/views/evidence.py` | Evidence create/update/review actions | PASS | Review remains separate from upload. |
| Export and inspection | `backend/apps/api/views/exports.py`, `backend/apps/api/views/admin.py`, `backend/apps/api/views/projects.py`, `backend/apps/exports/services.py`, `backend/apps/exports/services_admin.py` | Readiness, inspection, print-bundle, export history, eligibility | PARTIAL | Export gating still relies on placeholder readiness in `export_eligibility_report`. |
| Workflow permissions | `backend/apps/workflow/permissions.py` | Admin/lead/owner/reviewer/approver checks | PASS | Backend actions are permissioned. |
| Audit trail | `backend/apps/audit/services.py`, `backend/apps/audit/models/audit_event.py` | Audit logging | PASS | Model and services are present. |

## Frontend Modules

| Area | File(s) | Purpose | Status | Notes |
|---|---|---|---|---|
| Sidebar/navigation | `frontend/components/layout/sidebar.tsx`, `frontend/components/layout/topbar.tsx` | Main application navigation | PASS | Exposes worklist, inspection, readiness, print-pack, exports. |
| Indicator detail | `frontend/components/screens/indicator-detail-screen.tsx` | Indicator-level operational page | PARTIAL | Strong indicator page, but no explicit requirement-row UI. |
| Worklist | `frontend/components/screens/project-worklist-screen.tsx`, `frontend/components/worklist/*` | Indicator execution board | PASS | Framework/area/standard/indicator hierarchy is visible. |
| Readiness | `frontend/components/screens/project-readiness-screen.tsx` | Readiness summary | PASS | Readiness is exposed, but mostly at indicator summary level. |
| Inspection | `frontend/components/screens/project-inspection-screen.tsx` | MET-only inspection view | PASS | Screen exists; backend test still shows 500. |
| Print pack | `frontend/components/screens/project-print-pack-screen.tsx` | Print bundle preview | PASS | Structured preview exists. |
| Export history | `frontend/components/screens/project-export-history-screen.tsx` | Export job tracking | PASS | Export history surface is present. |
| AI/draft review | `frontend/components/screens/document-draft-review-screen.tsx` | Draft review and promotion UI | PASS | Keeps AI output reviewable. |
| API hooks | `frontend/lib/hooks/*`, `frontend/lib/api/client.ts` | Data access and cache invalidation | PASS | Hook layer is established. |
| Frontend tests | `frontend/tests/*` | Component and E2E coverage | PASS | Build and vitest are healthy; E2E is environment-blocked. |

## Workflow Modules

| Workflow Step | Implemented Location | Verified? | Notes |
|---|---|---|---|
| Framework | `backend/apps/frameworks/models/framework.py`, `backend/apps/api/views/frameworks.py`, `frontend/components/screens/*` | PASS | Framework remains the top-level reusable definition. |
| Framework Area / Domain | `backend/apps/frameworks/models/framework.py`, worklist UI grouping | PASS | Area/domain hierarchy is present. |
| Standard | `backend/apps/frameworks/models/framework.py`, worklist/print pack grouping | PASS | Standards are used for ordering and pack structure. |
| Framework Indicator | `backend/apps/indicators/models/indicator.py` | PASS | Indicator remains the central unit of work. |
| Evidence Requirement | `backend/apps/indicators/models/indicator.py`, `backend/apps/api/views/indicator.py` | PASS | First-class model and CRUD view exist. |
| Project | `backend/apps/projects/models/project.py`, `backend/apps/projects/services.py` | PASS | Project-specific instance exists. |
| Project Indicator | `backend/apps/indicators/models/indicator.py`, `backend/apps/api/views/project_indicators.py` | PASS | Working record for the project. |
| Project Evidence Requirement / Fulfillment | `backend/apps/indicators/models/indicator.py`, `backend/apps/indicators/services.py` | PASS | Requirement-level fulfillment exists. |
| Generated Draft / Uploaded Evidence | `backend/apps/ai_actions/models/document_draft.py`, `backend/apps/evidence/models/evidence.py` | PASS | Both link back to requirement/fulfillment. |
| Review / Approval | `backend/apps/evidence/services.py`, `backend/apps/indicators/services.py`, `backend/apps/api/views/evidence.py` | PASS | Human review gates are present. |
| Gap / CAPA | `backend/apps/exports/services.py`, readiness/export surfaces | NOT IMPLEMENTED | CAPA is still placeholder-level in current export logic. |
| Readiness Summary | `backend/apps/exports/services_admin.py`, frontend readiness screen | PARTIAL | Present, but export gating still uses placeholder readiness data. |
| Final Standard-wise Inspection Pack | `backend/apps/exports/services.py`, `frontend/components/screens/project-print-pack-screen.tsx`, `frontend/components/screens/project-inspection-screen.tsx` | PARTIAL | Preview exists; final ZIP export is not proven. |

