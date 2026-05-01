# API Route Contract

Source of truth: `backend/apps/api/urls.py` (68 routes as of 2026-05-01).

This table lists API routes, their view class, and intended consumer (frontend screen/action).

Legend:
- Consumer: `FE` (frontend), `FE+E2E` (covered in Playwright), `internal` (not exposed)

| Route | View | Consumer | Notes |
|---|---|---|---|
| `/api/health/` | `BackendHealthView` | FE+E2E | Docker health + `/api/health/` used by Caddy health checks |
| `/api/admin/ai/health/` | `AIHealthView` | FE | Admin system health page |
| `/api/admin/ai/test-connection/` | `AITestConnectionView` | FE | “Test AI connection” action |
| `/api/auth/session/` | `AuthSessionView` | FE | Session bootstrap |
| `/api/auth/login/` | `AuthLoginView` | FE+E2E | Login form |
| `/api/auth/logout/` | `AuthLogoutView` | FE | Logout action |
| `/api/users/` | `UserListCreateView` | FE | Non-admin user endpoints (if used) |
| `/api/admin/dashboard/` | `AdminDashboardView` | FE | Admin dashboard |
| `/api/admin/masters/<key>/` | `MasterValueListCreateView` | FE | Admin masters screens |
| `/api/admin/masters/<key>/<pk>/` | `MasterValueUpdateView` | FE | Admin masters screens |
| `/api/admin/users/` | `AdminUsersView` | FE | Admin users screen |
| `/api/admin/users/<pk>/` | `AdminUserUpdateView` | FE | Update user role, active, dept, etc |
| `/api/admin/users/<pk>/password/` | `AdminUserPasswordResetView` | FE | Reset password (UI wiring TBD) |
| `/api/audit/` | `AuditLogView` | FE | Audit page |
| `/api/admin/overrides/` | `ReopenOverridesView` | FE | Admin overrides page |
| `/api/admin/import/validate-framework/` | `FrameworkImportValidateView` | FE | Framework import validation step |
| `/api/admin/import/logs/` | `ImportLogListView` | FE | Import logs page |
| `/api/admin/ai/usage/` | `AIUsageLogListView` | FE | AI usage page |
| `/api/admin/queues/document-generation/` | `DocumentGenerationQueueView` | FE | Document generation queue page |
| `/api/admin/queues/document-generation/<indicator_id>/generate-draft/` | `DocumentDraftGenerateView` | FE | Generate draft action |
| `/api/admin/document-drafts/` | `DocumentDraftListCreateView` | FE | List drafts (queue summary + admin) |
| `/api/admin/document-drafts/<pk>/` | `DocumentDraftRetrieveUpdateView` | FE | Draft review/edit page |
| `/api/admin/document-drafts/<pk>/promote-to-evidence/` | `DocumentDraftPromoteToEvidenceView` | FE | Promote draft to evidence action |
| `/api/client-profiles/` | `ClientProfileListCreateView` | FE | Client profile screens |
| `/api/client-profiles/<pk>/` | `ClientProfileRetrieveUpdateView` | FE | Client profile screens |
| `/api/client-profiles/<pk>/variables-preview/` | `ClientProfileVariablesPreviewView` | FE | Variables preview |
| `/api/projects/` | `ProjectListCreateView` | FE+E2E | Project list + create |
| `/api/projects/<pk>/` | `ProjectRetrieveUpdateView` | FE | Project details |
| `/api/projects/<project_id>/initialize-from-framework/` | `ProjectInitializeFromFrameworkView` | FE+E2E | First-project initialization flow |
| `/api/projects/<project_id>/clone/` | `ProjectCloneView` | FE | Clone project action |
| `/api/projects/<project_id>/readiness/` | `ProjectReadinessView` | FE | Readiness page |
| `/api/projects/<project_id>/inspection-view/` | `ProjectInspectionView` | FE | Inspection page |
| `/api/projects/<project_id>/pre-inspection-check/` | `PreInspectionCheckView` | FE | Pre-inspection check |
| `/api/projects/<project_id>/standards-progress/` | `StandardsProgressView` | FE | Standards progress screen |
| `/api/projects/<project_id>/areas-progress/` | `AreasProgressView` | FE | Areas progress screen |
| `/api/dashboard/worklist/` | `DashboardWorklistView` | FE | Worklist dashboard |
| `/api/frameworks/` | `FrameworkListView` | FE+E2E | Framework list (LAB in smoke) |
| `/api/frameworks/template/` | `FrameworkTemplateView` | FE | Download CSV template |
| `/api/frameworks/<framework_id>/export/` | `FrameworkExportView` | FE | Export framework rows |
| `/api/frameworks/<framework_id>/analysis/` | `FrameworkAnalysisView` | FE | Framework analysis screen |
| `/api/admin/frameworks/` | `FrameworkAdminListCreateView` | FE | Admin frameworks screen |
| `/api/admin/frameworks/import/` | `FrameworkImportCreateView` | FE | Framework import upload |
| `/api/admin/frameworks/<framework_id>/classification/` | `FrameworkClassificationView` | FE | Classification screen data |
| `/api/admin/frameworks/<framework_id>/classify-indicators/` | `FrameworkClassifyIndicatorsView` | FE | “Run AI classification” |
| `/api/admin/frameworks/<framework_id>/classification/bulk-review/` | `FrameworkClassificationBulkReviewView` | FE+E2E | Bulk approve |
| `/api/admin/indicators/<indicator_id>/classification/` | `IndicatorClassificationUpdateView` | FE+E2E | Save row |
| `/api/project-indicators/<pk>/` | `ProjectIndicatorDetailView` | FE | Indicator detail |
| `/api/project-indicators/<pk>/assign/` | `ProjectIndicatorAssignView` | FE | Assign roles |
| `/api/project-indicators/<pk>/update-working-state/` | `ProjectIndicatorUpdateWorkingStateView` | FE | Notes/working state |
| `/api/project-indicators/<pk>/start/` | `ProjectIndicatorStartView` | FE | Start indicator |
| `/api/project-indicators/<pk>/send-for-review/` | `ProjectIndicatorSendForReviewView` | FE | Send for review |
| `/api/project-indicators/<pk>/mark-met/` | `ProjectIndicatorMarkMetView` | FE | Mark met |
| `/api/project-indicators/<pk>/reopen/` | `ProjectIndicatorReopenView` | FE | Reopen |
| `/api/project-indicators/<pk>/evidence/` | `ProjectIndicatorEvidenceListView` | FE | Evidence list |
| `/api/project-indicators/<pk>/ai-outputs/` | `ProjectIndicatorAIOutputsView` | FE | AI outputs per PI |
| `/api/evidence/` | `EvidenceCreateView` | FE | Create evidence |
| `/api/evidence/<pk>/update/` | `EvidenceUpdateView` | FE | Update evidence |
| `/api/evidence/<pk>/review/` | `EvidenceReviewView` | FE | Review evidence |
| `/api/recurring/queue/` | `RecurringQueueView` | FE | Recurring queue page |
| `/api/recurring/instances/<pk>/submit/` | `RecurringInstanceSubmitView` | FE | Submit recurring instance |
| `/api/recurring/instances/<pk>/approve/` | `RecurringInstanceApproveView` | FE | Approve recurring instance |
| `/api/ai/generate/` | `AIGenerateView` | FE | AI generate output (non-drafting) |
| `/api/ai/outputs/<pk>/accept/` | `AIAcceptView` | FE | Accept AI output (advisory-only) |
| `/api/exports/projects/<project_id>/excel/` | `ProjectExcelExportView` | FE | Exports screen |
| `/api/exports/projects/<project_id>/print-bundle/` | `ProjectPrintBundleExportView` | FE | Print pack export |
| `/api/exports/projects/<project_id>/physical-retrieval/` | `ProjectPhysicalRetrievalExportView` | FE | Physical retrieval export |
| `/api/exports/projects/<project_id>/history/` | `ExportHistoryView` | FE | Export history |
| `/api/exports/projects/<project_id>/generate/` | `ExportGenerateView` | FE | Start export job |
