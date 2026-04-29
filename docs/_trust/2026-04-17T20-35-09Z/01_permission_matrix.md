# 01 Permission Matrix

| Endpoint | Role Allowed | Enforced at endpoint | Notes |
| --- | --- | --- | --- |
| `GET /api/health/` | Public | `AllowAny` | Runtime health only. |
| `GET /api/auth/session/` | Public | `AllowAny` | Session discovery only. |
| `POST /api/auth/login/` | Public | `AllowAny` | Login only. |
| `POST /api/auth/logout/` | Public | `AllowAny` | Logout only. |
| `GET /api/users/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Assignment/search support. |
| `GET /api/frameworks/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only catalog. |
| `GET /api/frameworks/template/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only template payload. |
| `GET /api/frameworks/{id}/export/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only framework export. |
| `GET /api/frameworks/{id}/analysis/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only framework analysis. |
| `GET /api/projects/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Project list. |
| `POST /api/projects/` | `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early role check | Project creation guarded before mutation. |
| `GET /api/projects/{id}/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Project detail. |
| `PATCH /api/projects/{id}/` | `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early role check | Project metadata change. |
| `DELETE /api/projects/{id}/` | `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early role check | Project deletion. |
| `POST /api/projects/{id}/initialize-from-framework/` | `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early role check | Initialization guarded before mutation. |
| `POST /api/projects/{id}/clone/` | `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early role check | Clone guarded before mutation. |
| `GET /api/projects/{id}/readiness/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Readiness remains privileged. |
| `GET /api/projects/{id}/inspection-view/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only inspection output. |
| `GET /api/projects/{id}/pre-inspection-check/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only pre-inspection blockers. |
| `GET /api/projects/{id}/standards-progress/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only progress summary. |
| `GET /api/projects/{id}/areas-progress/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only progress summary. |
| `GET /api/dashboard/worklist/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Core operating queue. |
| `GET /api/project-indicators/{id}/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Indicator detail. |
| `POST /api/project-indicators/{id}/assign/` | `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early role check | Assignment/admin governance only. |
| `POST /api/project-indicators/{id}/update-working-state/` | Assigned `OWNER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Role verified before serializer/business logic. |
| `POST /api/project-indicators/{id}/start/` | Assigned `OWNER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Role verified before workflow command. |
| `POST /api/project-indicators/{id}/send-for-review/` | Assigned `OWNER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Role verified before workflow command. |
| `POST /api/project-indicators/{id}/mark-met/` | Assigned `APPROVER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Approval role enforced before workflow command. |
| `POST /api/project-indicators/{id}/reopen/` | `ADMIN` | `ExplicitAuthenticatedPermission` + early role check | Governance override only. |
| `GET /api/project-indicators/{id}/evidence/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only evidence list. |
| `POST /api/evidence/` | Assigned `OWNER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Evidence creation guarded before mutation. |
| `POST /api/evidence/{id}/update/` | Assigned `OWNER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Evidence edit guarded before mutation. |
| `POST /api/evidence/{id}/review/` | Assigned `REVIEWER`, `APPROVER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Review role enforced before mutation. |
| `GET /api/project-indicators/{id}/ai-outputs/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only advisory outputs. |
| `POST /api/ai/generate/` | Assigned `OWNER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Advisory generation guarded before mutation. |
| `POST /api/ai/outputs/{id}/accept/` | Assigned `OWNER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Acceptance guarded before mutation. |
| `GET /api/recurring/queue/` | Any authenticated role | `ExplicitAuthenticatedPermission` | Read-only queue. |
| `POST /api/recurring/instances/{id}/submit/` | Assigned `OWNER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Submission guarded before mutation. |
| `POST /api/recurring/instances/{id}/approve/` | Assigned `REVIEWER`, `APPROVER`, `ADMIN`, `LEAD` | `ExplicitAuthenticatedPermission` + early object-role check | Approval guarded before mutation. |
| `GET /api/admin/dashboard/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Explicit entry-level admin guard. |
| `GET/POST /api/admin/masters/{key}/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin registry only. |
| `PATCH /api/admin/masters/{key}/{id}/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin registry only. |
| `GET /api/admin/users/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin only. |
| `PATCH /api/admin/users/{id}/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin only. |
| `GET /api/audit/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Audit is read-only but restricted. |
| `GET /api/admin/overrides/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | History only. |
| `POST /api/admin/import/validate-framework/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin import validation. |
| `GET /api/admin/import/logs/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Import history. |
| `GET/POST /api/admin/frameworks/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin framework registry. |
| `POST /api/admin/frameworks/import/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin framework import. |
| `GET /api/client-profiles/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin-managed reference data. |
| `POST /api/client-profiles/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin-managed reference data. |
| `GET /api/client-profiles/{id}/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin-managed reference data. |
| `PATCH /api/client-profiles/{id}/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin-managed reference data. |
| `POST /api/client-profiles/{id}/variables-preview/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | Admin-managed preview only. |
| `GET /api/exports/projects/{id}/history/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` | History is restricted. |
| `POST /api/exports/projects/{id}/generate/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` + export eligibility engine | Returns `403` with `Export blocked: ...` when not eligible. |
| `GET /api/exports/projects/{id}/excel/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` + export eligibility engine | Preview blocked until eligible. |
| `GET /api/exports/projects/{id}/print-bundle/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` + export eligibility engine | Preview blocked until eligible. |
| `GET /api/exports/projects/{id}/physical-retrieval/` | `ADMIN`, `LEAD` | `AdminOrLeadPermission` + export eligibility engine | Preview blocked until eligible. |
