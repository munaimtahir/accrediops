# 03 — UI → API Mapping

## Authentication + Session

| UI action | API endpoint | Response | UI update |
|---|---|---|---|
| Sign in (`/login`) | `POST /api/auth/login/` | `{authenticated, user}` | Redirect to `/projects`; topbar session state updates |
| Session bootstrap | `GET /api/auth/session/` | `{authenticated, user}` | Guards/sidebar/topbar render by role |
| Sign out | `POST /api/auth/logout/` | `{authenticated:false}` | Redirect `/login`; session-cleared UI |

## Project register + lifecycle

| UI action | API endpoint | Response | UI update |
|---|---|---|---|
| Create project | `POST /api/projects/` | Project payload | Project list invalidated; open project modal closes |
| Initialize from framework (create form option) | `POST /api/projects/{id}/initialize-from-framework/` | `{created_project_indicators,...}` | Project/progress/worklist queries invalidated |
| Open project | `GET /api/projects/{id}/` | Project detail | Project overview cards/metrics render |
| Manage project | `PATCH /api/projects/{id}/` | Updated project | Project + project list refetch |
| Delete project | `DELETE /api/projects/{id}/` | `{id, deleted:true}` | Project list refetch; modal closes |
| Clone project | `POST /api/projects/{id}/clone/` | New project payload | Redirect to cloned project |

## Worklist + progress

| UI action | API endpoint | Response | UI update |
|---|---|---|---|
| Filter worklist | `GET /api/dashboard/worklist/` | Paginated rows | Grouped area/standard tiles update |
| Open standards progress | `GET /api/projects/{id}/standards-progress/` | Standard progress rows | Standards progress table/cards update |
| Open areas progress | `GET /api/projects/{id}/areas-progress/` | Area progress rows | Areas progress table/cards update |
| Open inspection mode | `GET /api/projects/{id}/inspection-view/` | MET-only section payload | Inspection list renders |
| Pre-inspection check | `GET /api/projects/{id}/pre-inspection-check/` | Missing/unapproved/overdue items | Pre-inspection warnings render |

## Indicator workbench (core)

| UI action | API endpoint | Response | UI update |
|---|---|---|---|
| Load indicator detail | `GET /api/project-indicators/{id}/` | Detail + readiness + audit | 8-section indicator workbench renders |
| Load indicator evidence list | `GET /api/project-indicators/{id}/evidence/` | Evidence items | Evidence section list updates |
| Load AI outputs | `GET /api/project-indicators/{id}/ai-outputs/` | AI output list | AI section list updates |
| Assign owner/reviewer/approver | `POST /api/project-indicators/{id}/assign/` | Updated indicator summary | Assignment card updates |
| Update working state | `POST /api/project-indicators/{id}/update-working-state/` | Updated indicator summary | Notes/priority/due-date reflect |
| Start indicator | `POST /api/project-indicators/{id}/start/` | Updated indicator summary | Status + next action update |
| Send for review | `POST /api/project-indicators/{id}/send-for-review/` | Updated indicator summary | Status + next action update |
| Approve / mark met | `POST /api/project-indicators/{id}/mark-met/` | Updated indicator summary | Completion state + governance trail update |
| Return / reopen | `POST /api/project-indicators/{id}/reopen/` | Updated indicator summary | Status resets to in-progress + audit trail |

## Evidence lifecycle

| UI action | API endpoint | Response | UI update |
|---|---|---|---|
| Add evidence | `POST /api/evidence/` | Evidence item payload | Evidence list refetch; readiness metrics refresh |
| Edit evidence | `POST /api/evidence/{id}/update/` | Evidence item payload | Evidence card data updates |
| Review evidence | `POST /api/evidence/{id}/review/` | Evidence item payload | Approval badges + readiness state update |

## Recurring lifecycle

| UI action | API endpoint | Response | UI update |
|---|---|---|---|
| Load recurring due today/overdue | `GET /api/recurring/queue/` | Queue rows | Due today + overdue tables render |
| Submit recurring instance | `POST /api/recurring/instances/{id}/submit/` | Updated recurring instance | Queue refetch + explicit next-action toast |
| Approve/reject recurring instance | `POST /api/recurring/instances/{id}/approve/` | Updated recurring instance | Instance status badges + queues refresh |

## AI assist

| UI action | API endpoint | Response | UI update |
|---|---|---|---|
| Generate guidance/draft/assessment | `POST /api/ai/generate/` | AI output payload | AI output list refetch |
| Accept AI output | `POST /api/ai/outputs/{id}/accept/` | Accepted output payload | Accepted flag updates |

## Admin and exports

| UI action | API endpoint | Response | UI update |
|---|---|---|---|
| Admin dashboard | `GET /api/admin/dashboard/` | KPI summary + recent events | Admin metric cards/table render |
| Audit filtering | `GET /api/audit/` | Audit rows | Audit table updates |
| Overrides feed | `GET /api/admin/overrides/` | Reopen override rows | Overrides table updates |
| Import validation | `POST /api/admin/import/validate-framework/` | Validation report | Inline validation panel updates |
| Import framework | `POST /api/admin/frameworks/import/` | Import summary + initialized counts | Framework list/log context refresh |
| Import logs | `GET /api/admin/import/logs/` | Log rows | Import log table updates |
| Readiness view | `GET /api/projects/{id}/readiness/` | Readiness aggregate | Readiness metrics render |
| Export history | `GET /api/exports/projects/{id}/history/` | Export jobs | Export history table updates |
| Export generate job | `POST /api/exports/projects/{id}/generate/` | Export job payload | History refetch + job row visible |
| Export excel | `GET /api/exports/projects/{id}/excel/` | Structured export payload | Success toast + response data handling |
| Export print bundle | `GET /api/exports/projects/{id}/print-bundle/` | Print bundle payload | Success toast + response data handling |
| Physical retrieval export | `GET /api/exports/projects/{id}/physical-retrieval/` | Physical item list | Retrieval summary card updates |
