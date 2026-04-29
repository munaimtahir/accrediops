# 01 — Backend API Map (System Truth)

Source: `backend/apps/api/urls.py` + corresponding view/service role guards.

## Auth

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/auth/session/` | GET | Session state + current user | Public | yes |
| `/api/auth/login/` | POST | Login | Public | yes |
| `/api/auth/logout/` | POST | Logout | Public | yes |

## System

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/health/` | GET | Backend+DB health probe | Public | yes |

## Users / Client Profiles

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/users/` | GET | User list for assignment/filtering | Authenticated | yes |
| `/api/client-profiles/` | GET | List client profiles | Authenticated | yes |
| `/api/client-profiles/` | POST | Create client profile | Authenticated | yes |
| `/api/client-profiles/<pk>/` | GET | Get client profile | Authenticated | yes |
| `/api/client-profiles/<pk>/` | PATCH | Update client profile | Authenticated | yes |
| `/api/client-profiles/<pk>/variables-preview/` | POST | Variable preview replacement | Authenticated | yes |

## Admin / Audit / Overrides

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/admin/dashboard/` | GET | Admin KPI summary | ADMIN or LEAD | yes |
| `/api/admin/masters/<key>/` | GET | List master values | ADMIN or LEAD | yes |
| `/api/admin/masters/<key>/` | POST | Create master value | ADMIN or LEAD | yes |
| `/api/admin/masters/<key>/<pk>/` | PATCH | Update master value | ADMIN or LEAD | yes |
| `/api/admin/users/` | GET | Admin user list | ADMIN or LEAD | yes |
| `/api/admin/users/<pk>/` | PATCH | Update user role/metadata | ADMIN or LEAD | yes |
| `/api/audit/` | GET | Audit log query | ADMIN or LEAD | yes |
| `/api/admin/overrides/` | GET | Reopen override audit feed | ADMIN or LEAD | yes |
| `/api/admin/import/validate-framework/` | POST | Validate framework CSV | ADMIN or LEAD | yes |
| `/api/admin/import/logs/` | GET | Framework import logs | ADMIN or LEAD | yes |
| `/api/admin/frameworks/` | GET | Admin framework list | ADMIN or LEAD | yes |
| `/api/admin/frameworks/` | POST | Create framework | ADMIN or LEAD | yes |
| `/api/admin/frameworks/import/` | POST | Import framework + initialize project | ADMIN or LEAD | yes |

## Frameworks

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/frameworks/` | GET | Framework catalog | Authenticated | yes |
| `/api/frameworks/template/` | GET | CSV template contract | Authenticated | yes |
| `/api/frameworks/<framework_id>/export/` | GET | Framework export data | Authenticated | yes |
| `/api/frameworks/<framework_id>/analysis/` | GET | Framework analysis metrics | Authenticated | yes |

## Projects

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/projects/` | GET | Project register list | Authenticated | yes |
| `/api/projects/` | POST | Create project | ADMIN or LEAD (service-enforced) | yes |
| `/api/projects/<pk>/` | GET | Project detail | Authenticated | yes |
| `/api/projects/<pk>/` | PATCH | Update project | ADMIN or LEAD (service-enforced) | yes |
| `/api/projects/<pk>/` | DELETE | Delete project | ADMIN or LEAD (service-enforced) | yes |
| `/api/projects/<project_id>/initialize-from-framework/` | POST | Initialize indicators from framework | ADMIN or LEAD (service-enforced) | yes |
| `/api/projects/<project_id>/clone/` | POST | Clone project shell | ADMIN or LEAD (service-enforced) | yes |
| `/api/projects/<project_id>/inspection-view/` | GET | MET-only inspection payload | Authenticated | yes |
| `/api/projects/<project_id>/pre-inspection-check/` | GET | Inspection blockers | Authenticated | yes |
| `/api/projects/<project_id>/standards-progress/` | GET | Standard progress grid | Authenticated | yes |
| `/api/projects/<project_id>/areas-progress/` | GET | Area progress grid | Authenticated | yes |
| `/api/projects/<project_id>/readiness/` | GET | Admin readiness summary | ADMIN or LEAD | yes |

## Dashboard / Worklist

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/dashboard/worklist/` | GET | Worklist rows + filters | Authenticated | yes |

## Project Indicators / Workflow

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/project-indicators/<pk>/` | GET | Indicator detail payload | Authenticated | yes |
| `/api/project-indicators/<pk>/assign/` | POST | Assign owner/reviewer/approver | ADMIN or LEAD (service-enforced) | yes |
| `/api/project-indicators/<pk>/update-working-state/` | POST | Update notes/priority/due-date | OWNER of indicator, or ADMIN/LEAD (service-enforced) | yes |
| `/api/project-indicators/<pk>/start/` | POST | Workflow start transition | OWNER of indicator, or ADMIN/LEAD (service-enforced) | yes |
| `/api/project-indicators/<pk>/send-for-review/` | POST | Move to review | OWNER of indicator, or ADMIN/LEAD (service-enforced) | yes |
| `/api/project-indicators/<pk>/mark-met/` | POST | Final approval transition | APPROVER of indicator, or ADMIN/LEAD (service-enforced) | yes |
| `/api/project-indicators/<pk>/reopen/` | POST | Governance reopen transition | ADMIN only (service-enforced) | yes |
| `/api/project-indicators/<pk>/evidence/` | GET | Evidence list for indicator | Authenticated | yes |
| `/api/project-indicators/<pk>/ai-outputs/` | GET | AI outputs for indicator | Authenticated | yes |

## Evidence

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/evidence/` | POST | Create evidence | OWNER of indicator, or ADMIN/LEAD (service-enforced) | yes |
| `/api/evidence/<pk>/update/` | POST | Update evidence metadata/version data | OWNER of indicator, or ADMIN/LEAD (service-enforced) | yes |
| `/api/evidence/<pk>/review/` | POST | Review evidence validity/completeness/approval | REVIEWER/APPROVER on indicator, or ADMIN/LEAD (service-enforced) | yes |

## Recurring

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/recurring/queue/` | GET | Recurring queue filters | Authenticated | yes |
| `/api/recurring/instances/<pk>/submit/` | POST | Submit recurring instance | OWNER on indicator, or ADMIN/LEAD (service-enforced) | yes |
| `/api/recurring/instances/<pk>/approve/` | POST | Approve/reject recurring instance | REVIEWER/APPROVER on indicator, or ADMIN/LEAD (service-enforced) | yes |

## AI

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/ai/generate/` | POST | Generate advisory AI output | OWNER on indicator, or ADMIN/LEAD (service-enforced) | yes |
| `/api/ai/outputs/<pk>/accept/` | POST | Accept AI output manually | OWNER on indicator, or ADMIN/LEAD (service-enforced) | yes |

## Exports

| Endpoint | Method | Purpose | Required role | Used in frontend |
|---|---|---|---|---|
| `/api/exports/projects/<project_id>/excel/` | GET | Export excel payload | Authenticated (frontend-gated ADMIN/LEAD) | yes |
| `/api/exports/projects/<project_id>/print-bundle/` | GET | Export print bundle payload | Authenticated (frontend-gated ADMIN/LEAD) | yes |
| `/api/exports/projects/<project_id>/physical-retrieval/` | GET | Physical retrieval export | Authenticated (frontend-gated ADMIN/LEAD) | yes |
| `/api/exports/projects/<project_id>/history/` | GET | Export job history | ADMIN or LEAD | yes |
| `/api/exports/projects/<project_id>/generate/` | POST | Create export job | ADMIN or LEAD | yes |
