# Frontend To Backend Matrix

| Frontend Action ID | Page/Route | Visible Action | Frontend File | API Method | API Path | Backend View/Handler | Backend Exists? | Payload Match? | Response Used? | Role Match? | Status | Gap/Fix Needed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FE-A01 | `/login` | Sign in | `use-auth.ts` | POST | `/api/auth/login/` | `AuthLoginView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A02 | topbar | Sign out | `use-auth.ts` | POST | `/api/auth/logout/` | `AuthLogoutView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A03 | `/projects` | Create project | `create-project-form.tsx` | POST + POST | `/api/projects/`, `/api/projects/:id/initialize-from-framework/` | `ProjectListCreateView`, `ProjectInitializeFromFrameworkView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A06 | `/projects` | Manage project | `project-management-form.tsx` | PATCH / DELETE | `/api/projects/:id/` | `ProjectRetrieveUpdateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A11 | overview | Physical retrieval | `project-overview-screen.tsx` | GET | `/api/exports/projects/:id/physical-retrieval/` | `ProjectPhysicalRetrievalExportView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A12 | overview | Clone project | `clone-project-form.tsx` | POST | `/api/projects/:id/clone/` | `ProjectCloneView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A14 | overview | Generate print bundle | `useProjectExport` | GET | `/api/exports/projects/:id/print-bundle/` | `ProjectPrintBundleExportView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A15 | overview | Generate excel | `useProjectExport` | GET | `/api/exports/projects/:id/excel/` | `ProjectExcelExportView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A19 | worklist | filters/search | `use-worklist.ts` | GET | `/api/dashboard/worklist/` | `DashboardWorklistView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A21 | worklist | indicator tile -> drawer | `indicator-drawer.tsx` | GET family | `/api/project-indicators/:id/`, `/api/project-indicators/:id/evidence/`, `/api/project-indicators/:id/ai-outputs/` | detail/evidence/AI list views | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A22 | drawer/detail | Add evidence | `evidence-form.tsx` | POST | `/api/evidence/` | `EvidenceCreateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A23 | drawer/detail | Review evidence | `evidence-review-form.tsx` | POST | `/api/evidence/:id/review/` | `EvidenceReviewView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A24 | drawer/detail | Submit recurring instance | `useSubmitRecurring` | POST | `/api/recurring/instances/:id/submit/` | `RecurringInstanceSubmitView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A25 | drawer/detail | Approve recurring instance | `useApproveRecurring` | POST | `/api/recurring/instances/:id/approve/` | `RecurringInstanceApproveView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A26 | drawer/detail | Save working state | `working-state-form.tsx` | POST | `/api/project-indicators/:id/update-working-state/` | `ProjectIndicatorUpdateWorkingStateView` | yes | yes | yes | partial | ROLE_MISMATCH | frontend shows to any OWNER role; backend requires assigned owner |
| FE-A27 | drawer/detail | Start | `useStartIndicator` | POST | `/api/project-indicators/:id/start/` | `ProjectIndicatorStartView` | yes | yes | yes | partial | ROLE_MISMATCH | same assigned-owner mismatch |
| FE-A28 | drawer/detail | Send for Review | `useSendForReview` | POST | `/api/project-indicators/:id/send-for-review/` | `ProjectIndicatorSendForReviewView` | yes | yes | yes | partial | ROLE_MISMATCH | same assigned-owner mismatch |
| FE-A29 | drawer/detail | Mark as Met | `useMarkMet` | POST | `/api/project-indicators/:id/mark-met/` | `ProjectIndicatorMarkMetView` | yes | yes | yes | partial | ROLE_MISMATCH | frontend enables any APPROVER role; backend requires assigned approver |
| FE-A30 | drawer/detail | Reopen | `useReopen` | POST | `/api/project-indicators/:id/reopen/` | `ProjectIndicatorReopenView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A31 | pending actions | Print actionable list | `project-pending-actions-screen.tsx` | none | none | none | no | n/a | n/a | n/a | FRONTEND_ONLY | local-only print action |
| FE-A33 | recurring queue | Submit | `project-recurring-screen.tsx` | POST | `/api/recurring/instances/:id/submit/` | `RecurringInstanceSubmitView` | yes | yes | yes | partial | ROLE_MISMATCH | UI not role-gated before submit button |
| FE-A37 | exports | Generate print-bundle/excel job | `useGenerateExport` | POST | `/api/exports/projects/:id/generate/` | `ExportGenerateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A38 | exports | Physical retrieval | `usePhysicalRetrievalExport` | GET | `/api/exports/projects/:id/physical-retrieval/` | `ProjectPhysicalRetrievalExportView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A39 | print pack | Generate Print Pack | `useProjectExport` | GET | `/api/exports/projects/:id/print-bundle/` | `ProjectPrintBundleExportView` | yes | yes | yes | no | ROLE_MISMATCH | add same export role guard used elsewhere |
| FE-A40 | project/admin client profile | Save client profile | `useSaveClientProfile` | POST/PATCH | `/api/client-profiles/`, `/api/client-profiles/:id/` | client profile views | yes | yes | yes | no | ROLE_MISMATCH | page visible wider than backend permission |
| FE-A41 | project/admin client profile | Preview replacement | `useVariablesPreview` | POST | `/api/client-profiles/:id/variables-preview/` | `ClientProfileVariablesPreviewView` | yes | yes | yes | no | ROLE_MISMATCH | same page-vs-permission mismatch |
| FE-A43 | indicator detail | Save assignment | `useAssignIndicator` | POST | `/api/project-indicators/:id/assign/` | `ProjectIndicatorAssignView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A44 | indicator detail | Save working state | `useUpdateWorkingState` | POST | `/api/project-indicators/:id/update-working-state/` | `ProjectIndicatorUpdateWorkingStateView` | yes | yes | yes | partial | ROLE_MISMATCH | same assigned-owner mismatch |
| FE-A45 | indicator detail | Add/Edit evidence | `useAddEvidence` / `useEditEvidence` | POST | `/api/evidence/`, `/api/evidence/:id/update/` | evidence views | yes | yes | yes | partial | ROLE_MISMATCH | same assigned-owner mismatch |
| FE-A46 | indicator detail | Save review | `useReviewEvidence` | POST | `/api/evidence/:id/review/` | `EvidenceReviewView` | yes | yes | yes | partial | ROLE_MISMATCH | frontend enables any reviewer/approver role; backend requires assignment |
| FE-A47 | indicator detail | Start | `useStartIndicator` | POST | `/api/project-indicators/:id/start/` | `ProjectIndicatorStartView` | yes | yes | yes | partial | ROLE_MISMATCH | same |
| FE-A48 | indicator detail | Send for Review | `useSendForReview` | POST | `/api/project-indicators/:id/send-for-review/` | `ProjectIndicatorSendForReviewView` | yes | yes | yes | partial | ROLE_MISMATCH | same |
| FE-A49 | indicator detail | Approve (Mark as Met) | `useMarkMet` | POST | `/api/project-indicators/:id/mark-met/` | `ProjectIndicatorMarkMetView` | yes | yes | yes | partial | ROLE_MISMATCH | same |
| FE-A50 | indicator detail | Return | `useReopen` | POST | `/api/project-indicators/:id/reopen/` | `ProjectIndicatorReopenView` | yes | yes | yes | yes | BROKEN_WIRING | label suggests return-to-review workflow but endpoint is generic admin reopen |
| FE-A51 | indicator detail | Reopen | `useReopen` | POST | `/api/project-indicators/:id/reopen/` | `ProjectIndicatorReopenView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A52 | indicator detail | Submit recurring instance | `useSubmitRecurring` | POST | `/api/recurring/instances/:id/submit/` | `RecurringInstanceSubmitView` | yes | yes | yes | partial | ROLE_MISMATCH | same assigned-owner mismatch |
| FE-A53 | indicator detail | Approve recurring instance | `useApproveRecurring` | POST | `/api/recurring/instances/:id/approve/` | `RecurringInstanceApproveView` | yes | yes | yes | partial | ROLE_MISMATCH | same assigned-reviewer mismatch |
| FE-A54 | indicator detail | Generate guidance | `useGenerateAI` | POST | `/api/ai/generate/` | `AIGenerateView` | yes | yes | yes | partial | ROLE_MISMATCH | frontend enables any OWNER role; backend requires assigned owner |
| FE-A55 | indicator detail | Generate draft | `useGenerateAI` | POST | `/api/ai/generate/` | `AIGenerateView` | yes | yes | yes | partial | ROLE_MISMATCH | same |
| FE-A56 | indicator detail | Generate assessment | `useGenerateAI` | POST | `/api/ai/generate/` | `AIGenerateView` | yes | yes | yes | partial | ROLE_MISMATCH | same |
| FE-A57 | indicator detail | Accept output | `useAcceptAI` | POST | `/api/ai/outputs/:id/accept/` | `AIAcceptView` | yes | yes | yes | partial | ROLE_MISMATCH | same assigned-owner mismatch |
| FE-A58 | admin users | role/status change | `useUpdateAdminUser` | PATCH | `/api/admin/users/:id/` | `AdminUserUpdateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A61 | admin/project client profile | Preview replacement | `useVariablesPreview` | POST | `/api/client-profiles/:id/variables-preview/` | `ClientProfileVariablesPreviewView` | yes | yes | yes | yes on admin route | MATCHED_E2E | none |
| FE-A62 | admin frameworks | Create framework | `useCreateFramework` | POST | `/api/admin/frameworks/` | `FrameworkAdminListCreateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A63 | admin frameworks | Download template | `useFrameworkTemplate` | GET | `/api/frameworks/template/` | `FrameworkTemplateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A64 | admin frameworks | Download export CSV | `useFrameworkExport` | GET | `/api/frameworks/:id/export/` | `FrameworkExportView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A65 | admin frameworks | Validate import | `useFrameworkImportValidate` | POST multipart | `/api/admin/import/validate-framework/` | `FrameworkImportValidateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A66 | admin frameworks | Run import | `useFrameworkImportCreate` | POST multipart | `/api/admin/frameworks/import/` | `FrameworkImportCreateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A67 | admin import logs | Validate sample | `useFrameworkImportValidation` | POST multipart | `/api/admin/import/validate-framework/` | `FrameworkImportValidateView` | yes | yes | yes | yes | MATCHED_E2E | none |
| FE-A68 | admin overrides | Execute override | `useReopen` | POST | `/api/project-indicators/:id/reopen/` | `ProjectIndicatorReopenView` | yes | yes | yes | no | ROLE_MISMATCH | page allows LEAD to initiate; backend is ADMIN only |
| FE-A69 | admin masters | Add | `useSaveMasterValue` | POST | `/api/admin/masters/:key/` | `MasterValueListCreateView.post` | yes | yes | yes | yes | MATCHED_E2E | add edit UI if patch endpoint should be used |
