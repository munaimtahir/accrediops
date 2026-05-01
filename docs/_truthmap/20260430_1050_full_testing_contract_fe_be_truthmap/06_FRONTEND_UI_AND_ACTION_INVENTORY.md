# Frontend UI and Action Inventory

**Date:** 2026-04-30
**Framework:** Next.js 15 (App Router)
**Source of Truth:** `frontend/app/` and `frontend/components/screens/`

## 1. Global & Authentication
| Route | Screen Component | Major Actions | Backend Linkages |
|-------|------------------|---------------|------------------|
| `/login` | `LoginScreen` | Authenticate user | `api/auth/login/` |
| `/` | `ProjectWorklistScreen` | View assigned tasks, Navigate to indicators | `api/dashboard/worklist/` |

## 2. Project Management
| Route | Screen Component | Major Actions | Backend Linkages |
|-------|------------------|---------------|------------------|
| `/projects` | `ProjectsListScreen` | Create project, Clone project, Delete project | `api/projects/`, `api/projects/<id>/clone/` |
| `/projects/[id]` | `ProjectOverviewScreen` | Initialize from framework, Update project details | `api/projects/<id>/initialize-from-framework/` |
| `/projects/[id]/readiness`| `ProjectReadinessScreen`| Monitor status by area/standard | `api/projects/<id>/readiness/` |
| `/projects/[id]/inspection`| `ProjectInspectionScreen`| Run pre-inspection check, View inspector portal | `api/projects/<id>/inspection-view/` |
| `/projects/[id]/standards-progress`| `StandardsProgressScreen`| Track progress across standards | `api/projects/<id>/standards-progress/` |
| `/projects/[id]/areas-progress`| `AreasProgressScreen`| Track progress across areas | `api/projects/<id>/areas-progress/` |
| `/projects/[id]/recurring`| `ProjectRecurringScreen`| Submit recurring evidence, Approve instances | `api/recurring/queue/`, `api/recurring/instances/<id>/submit/` |
| `/projects/[id]/exports` | `ProjectPrintPackScreen` | Generate Excel, Print Bundle, Physical Retrieval | `api/exports/projects/<id>/generate/` |
| `/projects/[id]/client-profile`| `ProjectClientProfileScreen`| Preview/Edit client specific variables | `api/client-profiles/<id>/` |

## 3. Indicator Workspace
| Route | Screen Component | Major Actions | Backend Linkages |
|-------|------------------|---------------|------------------|
| `/project-indicators/[id]`| `IndicatorDetailScreen`| Assign user, Start task, Save drafts, Add evidence, AI Generation | `api/project-indicators/<id>/`, `api/evidence/`, `api/ai/generate/` |
| `(Drawer/Modal)` | `IndicatorDrawer` | Quick view/edit from worklist or board | `api/project-indicators/<id>/` |

## 4. Administrative Workspace
| Route | Screen Component | Major Actions | Backend Linkages |
|-------|------------------|---------------|------------------|
| `/admin` | `AdminDashboardScreen` | View system stats | `api/admin/dashboard/` |
| `/admin/users` | `AdminUsersScreen` | Create/Update users, Reset passwords | `api/admin/users/` |
| `/admin/frameworks` | `AdminFrameworksScreen` | Upload framework (CSV), Export framework | `api/admin/frameworks/`, `api/admin/frameworks/import/` |
| `/admin/frameworks/classification`| `IndicatorClassificationScreen`| Bulk AI classification, Manual review/override | `api/admin/frameworks/<id>/classification/` |
| `/admin/masters/[key]` | `AdminMastersScreen` | Manage statuses, priorities, document types | `api/admin/masters/<key>/` |
| `/admin/audit` | `AdminAuditScreen` | Filter and view system audit logs | `api/audit/` |
| `/admin/ai/usage` | `AdminAIUsageScreen` | Monitor AI costs and token consumption | `api/admin/ai/usage/` |
| `/admin/system-health` | `SystemHealthScreen` | Check BE/AI connectivity | `api/health/`, `api/admin/ai/health/` |
| `/admin/overrides` | `AdminOverridesScreen` | Manage evidence reopening permissions | `api/admin/overrides/` |
| `/admin/import-logs` | `AdminImportLogsScreen` | Review framework import errors | `api/admin/import/logs/` |
| `/admin/queues/document-generation`| `AdminDocumentGenerationQueueScreen`| Manage automated document drafting | `api/admin/queues/document-generation/` |
| `/admin/document-drafts/[id]`| `DocumentDraftReviewScreen`| Edit generated drafts, Promote to evidence | `api/admin/document-drafts/<id>/promote-to-evidence/` |

## 5. Major Actions (Inventory)
| Action Category | Components involved | API Interaction |
|-----------------|---------------------|-----------------|
| **Project Setup** | `ProjectsListScreen`, `ProjectOverviewScreen` | `POST /api/projects/`, `POST /api/projects/<id>/initialize-from-framework/` |
| **Workflow State** | `IndicatorDetailScreen` | `POST /api/project-indicators/<id>/start/`, `POST /api/project-indicators/<id>/send-for-review/`, `POST /api/project-indicators/<id>/mark-met/` |
| **Evidence Mgmt** | `IndicatorDetailScreen`, `EvidenceReviewModal` | `POST /api/evidence/`, `POST /api/evidence/<id>/review/` |
| **AI Support** | `IndicatorDetailScreen`, `AIPanel` | `POST /api/ai/generate/`, `POST /api/ai/outputs/<id>/accept/` |
| **Governance** | `AdminAuditScreen`, `AdminOverridesScreen` | `GET /api/audit/`, `POST /api/admin/overrides/` |
| **Classification**| `IndicatorClassificationScreen` | `POST /api/admin/frameworks/<id>/classify-indicators/`, `POST /api/admin/frameworks/<id>/classification/bulk-review/` |
| **Reporting** | `ProjectPrintPackScreen` | `POST /api/exports/projects/<id>/generate/`, `GET /api/exports/projects/<id>/history/` |
