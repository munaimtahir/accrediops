# API Payload Contract Check

| Frontend API Function | Frontend File | Method/Path Used | Backend Endpoint | Request Payload Fields | Backend Expected Fields | Response Expected by Frontend | Backend Response | Status | Gap |
|---|---|---|---|---|---|---|---|---|---|
| `useLogin` | `use-auth.ts` | `POST /api/auth/login/` | `AuthLoginView` | `username`, `password` | same | `authenticated`, `user` | same | MATCHED_E2E | none |
| `useLogout` | `use-auth.ts` | `POST /api/auth/logout/` | `AuthLogoutView` | `{}` | none | `authenticated: false` | same | MATCHED_E2E | none |
| `useCreateProject` | `use-mutations.ts` | `POST /api/projects/` | `ProjectListCreateView.post` | `name`, `client_name`, `accrediting_body_name`, `framework`, `client_profile`, `start_date`, `target_date`, `notes` | `ProjectWriteSerializer` same fields | project detail incl `id` | project detail serializer | MATCHED_E2E | none |
| `useInitializeProjectFromFramework` | `use-mutations.ts` | `POST /api/projects/:id/initialize-from-framework/` | initialize view | `create_initial_instances` | `InitializeProjectSerializer` same | initialization counts | service result | MATCHED_E2E | none |
| `useUpdateProject` | `use-mutations.ts` | `PATCH /api/projects/:id/` | update view | same project write subset | same | updated project | same | MATCHED_E2E | none |
| `useDeleteProject` | `use-mutations.ts` | `DELETE /api/projects/:id/` | delete view | none | none | `{id, deleted}` | same | MATCHED_E2E | none |
| `useCloneProject` | `use-mutations.ts` | `POST /api/projects/:id/clone/` | clone view | `name`, `client_name` | `CloneProjectSerializer` same | created project detail | same | MATCHED_E2E | none |
| `useAssignIndicator` | `use-mutations.ts` | `POST /api/project-indicators/:id/assign/` | assign view | `owner_id`, `reviewer_id`, `approver_id`, `priority`, `due_date`, `notes` | `AssignProjectIndicatorSerializer` same | project-indicator summary | same | MATCHED_E2E | none |
| `useUpdateWorkingState` | `use-mutations.ts` | `POST /api/project-indicators/:id/update-working-state/` | working-state view | `notes`, `due_date`, `priority` | `UpdateWorkingStateSerializer` same | project-indicator summary | same | MATCHED_E2E | none |
| `useStartIndicator` | `use-mutations.ts` | `POST /api/project-indicators/:id/start/` | start view | `reason` | `WorkflowActionSerializer.reason` optional | project-indicator summary | same | MATCHED_E2E | none |
| `useSendForReview` | `use-mutations.ts` | `POST /api/project-indicators/:id/send-for-review/` | send-review view | `reason` | same | project-indicator summary | same | MATCHED_E2E | none |
| `useMarkMet` | `use-mutations.ts` | `POST /api/project-indicators/:id/mark-met/` | mark-met view | `reason` | same | project-indicator summary | same | MATCHED_E2E | none |
| `useReopen` | `use-mutations.ts` | `POST /api/project-indicators/:id/reopen/` | reopen view | `reason` | `ReopenWorkflowActionSerializer.reason` required | project-indicator summary | same | MATCHED_E2E | UI label semantics differ for `Return` |
| `useAddEvidence` | `use-mutations.ts` | `POST /api/evidence/` | evidence create | `project_indicator_id`, `title`, `description`, `source_type`, `file_or_url`, `text_content`, `evidence_date`, `notes`, `physical_location_type`, `location_details`, `file_label`, `is_physical_copy_available` | `CreateEvidenceSerializer` same | evidence item | `EvidenceItemSerializer` | MATCHED_E2E | none |
| `useEditEvidence` | `use-mutations.ts` | `POST /api/evidence/:id/update/` | evidence update | partial evidence fields, omits `project_indicator_id` | `UpdateEvidenceSerializer` partial mutable fields | evidence item | same | MATCHED_E2E | none |
| `useReviewEvidence` | `use-mutations.ts` | `POST /api/evidence/:id/review/` | evidence review | `validity_status`, `completeness_status`, `approval_status`, `review_notes` | `EvidenceReviewSerializer` same | evidence item | same | MATCHED_E2E | none |
| `useSubmitRecurring` | `use-mutations.ts` | `POST /api/recurring/instances/:id/submit/` | recurring submit | `evidence_item_id`, `text_content`, `notes` | `SubmitRecurringInstanceSerializer` same names; mapped to `evidence_item` | recurring instance | same | MATCHED_E2E | none |
| `useApproveRecurring` | `use-mutations.ts` | `POST /api/recurring/instances/:id/approve/` | recurring approve | `approval_status`, `notes` | `ApproveRecurringInstanceSerializer` same | recurring instance | same | MATCHED_E2E | none |
| `useGenerateAI` | `use-mutations.ts` | `POST /api/ai/generate/` | AI generate | `project_indicator_id`, `output_type`, `user_instruction` | `GenerateAIOutputSerializer` same; `project_indicator_id` maps to relation | AI output | `GeneratedOutputSerializer` | MATCHED_E2E | none |
| `useAcceptAI` | `use-mutations.ts` | `POST /api/ai/outputs/:id/accept/` | AI accept | `{}` | empty serializer | AI output | `GeneratedOutputSerializer` | MATCHED_E2E | none |
| `useProjectExport` excel | `use-mutations.ts` | `GET /api/exports/projects/:id/excel/` | excel export | none | none | `ExportResponse` with `message`, `format`, data payload | inline payload with `bundle` | MATCHED_E2E | none |
| `useProjectExport` print-bundle | `use-mutations.ts` | `GET /api/exports/projects/:id/print-bundle/` | print bundle export | none | none | `ExportResponse.sections` or `.bundle.sections` | inline payload with `sections` | MATCHED_E2E | frontend already handles both shapes |
| `useGenerateExport` | `use-readiness.ts` | `POST /api/exports/projects/:id/generate/` | export generate | `type`, `parameters` | backend reads `type`, `parameters` ad hoc | generic record shown in history | `ExportJobSerializer` | MATCHED_E2E | none |
| `useSaveClientProfile` create/update | `use-client-profiles.ts` | `POST /api/client-profiles/`, `PATCH /api/client-profiles/:id/` | client profile views | `organization_name`, `address`, `license_number`, `registration_number`, `contact_person`, `department_names`, `linked_user_ids` | `ClientProfileSerializer` | client profile | serializer output | MATCHED_E2E | permission mismatch at page level, not payload |
| `useVariablesPreview` | `use-client-profiles.ts` | `POST /api/client-profiles/:id/variables-preview/` | preview view | `text` | `VariablesPreviewSerializer.text` | `replaced_text` | `{text, replaced_text}` | MATCHED_E2E | none |
| `useSaveMasterValue` create | `use-admin.ts` | `POST /api/admin/masters/:key/` | master create | generic payload incl `code`, `label`, `is_active`, `sort_order` | `MasterValueSerializer` | created row | same | MATCHED_E2E | none |
| `useSaveMasterValue` update | `use-admin.ts` | `PATCH /api/admin/masters/:key/:id/` | master update | generic payload | `MasterValueSerializer` partial | updated row | same | UNTESTED | no visible edit UI uses this path |
| `useUpdateAdminUser` | `use-admin.ts` | `PATCH /api/admin/users/:id/` | admin user update | `role` or `is_active` | `UserAdminSerializer` partial | updated user | same | MATCHED_E2E | none |
| `useFrameworkImportValidate` / `useFrameworkImportValidation` | `use-framework-management.ts`, `use-admin.ts` | `POST /api/admin/import/validate-framework/` multipart | validate import | `project_id`, `file` | `FrameworkImportSerializer` same | validation result with counts/errors | same | MATCHED_E2E | none |
| `useFrameworkImportCreate` | `use-framework-management.ts` | `POST /api/admin/frameworks/import/` multipart | import create | `project_id`, `file` | `FrameworkImportSerializer` same | import result incl `framework_id`, `project_indicators_created` | same | MATCHED_E2E | none |

## Contract summary

- No confirmed path/method/payload mismatches were found.
- The major integration risk is permission/assignment mismatch, not request contract mismatch.
