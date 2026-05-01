# Backend API and Function Inventory

**Date:** 2026-04-30
**Base Path:** `/api/`
**Source of Truth:** `backend/apps/api/urls.py`

## 1. Authentication & Session
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/auth/login/` | POST | User login | Login Screen | Active |
| `api/auth/logout/` | POST | User logout | Header/Global | Active |
| `api/auth/session/` | GET | Check current session | App Initialization | Active |

## 2. System & Health
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/health/` | GET | Backend health check | System Health Screen | Active |
| `api/admin/ai/health/` | GET | AI service health | System Health Screen | Active |
| `api/admin/ai/test-connection/` | POST | Test AI connection | System Health Screen | Active |

## 3. Administrative - User & Master Data
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/admin/dashboard/` | GET | Admin overview stats | Admin Dashboard | Active |
| `api/admin/users/` | GET | List all users | User Management | Active |
| `api/admin/users/<int:pk>/` | PATCH | Update user details | User Management | Active |
| `api/admin/users/<int:pk>/password/` | POST | Reset user password | User Management | Active |
| `api/admin/masters/<str:key>/` | GET/POST | List/Create master values | Masters Management | Active |
| `api/admin/masters/<str:key>/<int:pk>/` | PATCH | Update master value | Masters Management | Active |
| `api/admin/overrides/` | GET/POST | Manage reopen overrides | Overrides Screen | Active |

## 4. Administrative - Governance & AI
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/audit/` | GET | System audit logs | Audit Log Screen | Active |
| `api/admin/ai/usage/` | GET | AI token/usage logs | AI Usage Screen | Active |
| `api/admin/import/logs/` | GET | Framework import logs | Import Logs Screen | Active |
| `api/admin/import/validate-framework/` | POST | Validate framework file | Framework Import | Active |
| `api/admin/queues/document-generation/` | GET | View generation queue | Document Queue | Active |
| `api/admin/queues/document-generation/<id>/generate-draft/` | POST | Start draft generation | Document Queue | Active |
| `api/admin/document-drafts/` | GET | List all drafts | Admin Dashboard/Queue | Active |
| `api/admin/document-drafts/<int:pk>/` | GET/PATCH | Review/Edit draft | Draft Review Screen | Active |
| `api/admin/document-drafts/<int:pk>/promote-to-evidence/` | POST | Finalize draft to evidence | Draft Review Screen | Active |

## 5. Framework Management
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/frameworks/` | GET | List available frameworks | Project Creation | Active |
| `api/frameworks/template/` | GET | Download CSV template | Admin Frameworks | Active |
| `api/admin/frameworks/` | GET/POST | Admin list/create | Admin Frameworks | Active |
| `api/admin/frameworks/import/` | POST | Upload framework | Admin Frameworks | Active |
| `api/admin/frameworks/<id>/classification/` | GET | View classification | Indicator Classification | Active |
| `api/admin/frameworks/<id>/classify-indicators/` | POST | Trigger AI classification | Indicator Classification | Active |
| `api/admin/frameworks/<id>/classification/bulk-review/` | POST | Bulk approve classif. | Indicator Classification | Active |
| `api/admin/indicators/<id>/classification/` | PATCH | Update single classif. | Indicator Classification | Active |
| `api/frameworks/<id>/analysis/` | GET | Fetch gap analysis | Framework Analysis | Active |
| `api/frameworks/<id>/export/` | GET | Export framework | Admin Frameworks | Active |

## 6. Project Operations
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/projects/` | GET/POST | List/Create projects | Projects List | Active |
| `api/projects/<int:pk>/` | GET/PATCH/DELETE| Project detail/update | Project Overview | Active |
| `api/projects/<id>/initialize-from-framework/` | POST | Seed indicators | Project Overview | Active |
| `api/projects/<id>/clone/` | POST | Copy project | Project List | Active |
| `api/projects/<id>/readiness/` | GET | Readiness dashboard | Project Readiness | Active |
| `api/projects/<id>/inspection-view/` | GET | Inspector portal data | Project Inspection | Active |
| `api/projects/<id>/pre-inspection-check/` | GET | Validation report | Project Inspection | Active |
| `api/projects/<id>/standards-progress/` | GET | Progress by standard | Standards Screen | Active |
| `api/projects/<id>/areas-progress/` | GET | Progress by area | Areas Screen | Active |
| `api/dashboard/worklist/` | GET | User task list | Workbench Home | Active |

## 7. Indicator & Evidence Lifecycle
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/project-indicators/<int:pk>/` | GET | Detail view | Indicator Detail | Active |
| `api/project-indicators/<id>/assign/` | POST | Assign user | Indicator Detail | Active |
| `api/project-indicators/<id>/start/` | POST | Start working | Indicator Detail | Active |
| `api/project-indicators/<id>/update-working-state/` | POST | Save notes/drafts | Indicator Detail | Active |
| `api/project-indicators/<id>/send-for-review/` | POST | Submit to QA | Indicator Detail | Active |
| `api/project-indicators/<id>/mark-met/` | POST | Final approval | Indicator Detail | Active |
| `api/project-indicators/<id>/reopen/` | POST | Send back to worker | Indicator Detail | Active |
| `api/project-indicators/<id>/evidence/` | GET | List evidence | Indicator Detail | Active |
| `api/project-indicators/<id>/ai-outputs/` | GET | List AI suggestions | Indicator Detail | Active |
| `api/evidence/` | POST | Create evidence | Indicator Detail | Active |
| `api/evidence/<int:pk>/update/` | POST | Edit evidence | Indicator Detail | Active |
| `api/evidence/<int:pk>/review/` | POST | Review evidence | Indicator Detail | Active |

## 8. Recurring Tasks & AI
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/recurring/queue/` | GET | View pending recurring | Recurring Screen | Active |
| `api/recurring/instances/<id>/submit/` | POST | Worker submission | Recurring Screen | Active |
| `api/recurring/instances/<id>/approve/` | POST | Admin approval | Recurring Screen | Active |
| `api/ai/generate/` | POST | Ask AI for content | Indicator Detail | Active |
| `api/ai/outputs/<int:pk>/accept/` | POST | Promote AI to draft | Indicator Detail | Active |

## 9. Exports
| Endpoint | Method | Purpose | Frontend Exposure | Status |
|----------|--------|---------|-------------------|--------|
| `api/exports/projects/<id>/excel/` | GET | Export project Excel | Project Exports | Active |
| `api/exports/projects/<id>/print-bundle/` | GET | Export print bundle | Project Exports | Active |
| `api/exports/projects/<id>/physical-retrieval/` | GET | Physical folder list | Project Exports | Active |
| `api/exports/projects/<id>/history/` | GET | List past exports | Export History | Active |
| `api/exports/projects/<id>/generate/` | POST | Trigger new export | Project Exports | Active |
