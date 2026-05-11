# Backend API Verification

| Endpoint/Action | Route | Serializer/View | Permission | Test Coverage | Status | Notes |
|---|---|---|---|---|---|---|
| List evidence requirements for framework indicator | `GET /api/indicators/<id>/evidence-requirements/` | `EvidenceRequirementListCreateView` | `ExplicitAuthenticatedPermission` | Present in API tests around indicator workflows | PASS | Framework-level requirement listing exists. |
| Create evidence requirement | `POST /api/indicators/<id>/evidence-requirements/` | `EvidenceRequirementListCreateView` | `ExplicitAuthenticatedPermission` | Present | PASS | Uses admin/lead service-side guardrails. |
| Update evidence requirement | `PATCH/PUT /api/evidence-requirements/<id>/` | `EvidenceRequirementUpdateView` | `ExplicitAuthenticatedPermission` | Present | PASS | Requirement CRUD exists. |
| Deactivate/delete safely | Requirement update path | Service/model support | `ExplicitAuthenticatedPermission` + service validation | Not fully confirmed | PARTIAL | Deactivation exists; delete safety not separately proven. |
| List project evidence fulfillments | Project indicator detail / requirement endpoints | `ProjectEvidenceRequirementUpdateView` and related serializers | `ExplicitAuthenticatedPermission` | Present | PASS | Requirement rows are in the backend. |
| Update fulfillment | `PATCH /api/project-evidence-requirements/<id>/` | `ProjectEvidenceRequirementUpdateView` | `ExplicitAuthenticatedPermission` | Present | PASS | Supported in service layer. |
| Submit fulfillment for review | Project fulfillment submit action | `submit_project_evidence_requirement` service / API action | Owner-level guardrail | Present | PASS | Human submission gate exists. |
| Approve fulfillment | Project fulfillment approval action | `approve_project_evidence_requirement` service / API action | Approver-level guardrail | Present | PASS | Reviewer/approver separation exists. |
| Reject fulfillment with reason | Project fulfillment rejection action | `reject_project_evidence_requirement` service / API action | Approver-level guardrail | Present | PASS | Reason required by service. |
| Readiness summary with requirement-level counts | `GET /api/projects/<id>/readiness/` | `ProjectReadinessView` / `project_readiness` | `AdminOrLeadPermission` | Present | PASS | Readiness endpoint exists. |
| Generate draft linked to requirement/fulfillment | `POST /api/admin/document-drafts/generate/` | Document draft generation views/services | `AdminOrLeadPermission` | Present | PASS | Drafts can target project evidence requirement. |
| Promote draft to evidence with linkage preserved | `POST /api/admin/document-drafts/<id>/promote/` | `PromoteDraftToEvidenceSerializer` / service | `AdminOrLeadPermission` | Present | PASS | Promotion creates evidence and retains linkage. |
| Upload/link evidence to requirement/fulfillment | `POST/PATCH /api/evidence/` and evidence update actions | Evidence serializers/views | Owner/reviewer guardrails | Present | PASS | `EvidenceItem.project_evidence_requirement` is supported. |
| Final pack preview or readiness summary | `GET /api/exports/projects/<id>/print-bundle/` | `ProjectPrintBundleExportView` | `AdminOrLeadPermission` plus export eligibility | Present | PARTIAL | Route exists, but current tests show 403 due export eligibility gating. |
| Missing mandatory evidence appears in blockers/report | readiness / export warnings | `export_eligibility_report`, `project_readiness`, `PreInspectionCheckView` | Admin/lead gated where appropriate | Present | PARTIAL | Gating exists, but export eligibility is still placeholder-driven. |
| Capability checks protect create/update/submit/approve/reject/export actions | workflow permissions | `workflow.permissions` and view permissions | Present | PASS | RBAC exists, though export gating is too coarse. |

### Observed API Issues

- `GET /api/exports/projects/<id>/print-bundle/` returned `403` in targeted tests for a project that the test setup expected to be exportable.
- `GET /api/projects/<id>/inspection-view/` returned `500` in targeted tests.
- The export route is protected, but the eligibility heuristic is still driven by placeholder readiness values in `backend/apps/exports/services.py`.

