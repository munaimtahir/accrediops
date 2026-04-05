# API Truth Map

## API route map source
- `OUT/discovery/2026-04-04T07-15-44Z/api_route_map.txt`
- `backend/apps/api/urls.py`

## Frontend ↔ API ↔ Backend truth table

| Feature | Frontend entry | API route | Backend handler | Status | Notes |
|---|---|---|---|---|---|
| Project listing | `ProjectsListScreen` | `GET /api/projects/` | `ProjectListCreateView.get` | **WORKING PERFECTLY** | Pagination-backed list response used. |
| Project creation | *(no active UI action discovered)* | `POST /api/projects/` | `ProjectListCreateView.post` | **NOT BUILT / NOT EXPOSED / NOT WIRED** (frontend) | Backend exists; frontend path missing. |
| Project clone | `CloneProjectForm` | `POST /api/projects/{id}/clone/` | `ProjectCloneView.post` | **WORKING PERFECTLY** | Role-disabled in UI for non-admin/lead. |
| Worklist | `ProjectWorklistScreen` | `GET /api/dashboard/worklist/` | `DashboardWorklistView` | **WORKING PERFECTLY** | Filters + pagination aligned. |
| Indicator detail | `IndicatorDetailScreen` | `GET /api/project-indicators/{id}/` | `ProjectIndicatorDetailView` | **WORKING PERFECTLY** | Rich payload consumed. |
| Indicator commands | action toolbar | `/start`, `/send-for-review`, `/mark-met`, `/reopen` | command views | **WORKING PERFECTLY** | No direct status mutation in UI. |
| Evidence create/update/review | evidence forms | `/api/evidence/`, `/update/`, `/review/` | evidence views | **WORKING PERFECTLY** | Separate review from indicator status. |
| Recurring queue/submit | recurring screen | `/api/recurring/queue/`, `/submit/` | recurring views/services | **WORKING PERFECTLY** | |
| Recurring approve | indicator detail modal | `/api/recurring/instances/{id}/approve/` | recurring approve view/service | **WORKING PERFECTLY** | |
| AI advisory | indicator AI panel | `/api/ai/generate/`, `/api/ai/outputs/{id}/accept/` | AI views | **WORKING PERFECTLY** | Accept remains advisory; indicator not auto-mutated. |
| Readiness/inspection | readiness + inspection screens | `/api/projects/{id}/readiness/`, `/inspection-view/`, `/pre-inspection-check/` | admin/projects views | **WORKING PERFECTLY** | |
| Print pack preview | print pack screen | `GET /api/exports/projects/{id}/print-bundle/` | `ProjectPrintBundleExportView` | **WORKING PERFECTLY** | Includes evidence and physical metadata. |
| Export history/generate | export screen | `/history/`, `/generate/` | admin export views | **WORKING PERFECTLY** | |
| Client profile + variable preview | client profile screen | `/api/client-profiles/{id}/`, `/variables-preview/` | users views | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Linking UX to project remains thin. |
| Admin surfaces | admin screens | `/api/admin/*`, `/api/audit/` | admin views | **WORKING BUT NEEDS COMPLETION OR DEBUGGING** | Overrides UI primarily reports events. |

## Alignment verdict
- Core high-risk workflows are wired end-to-end.
- Biggest mismatch is **frontend exposure gaps** (notably project creation/init flow) versus existing backend capability.
- Contract artifact (`openapi.yaml`) is not aligned with implemented API surface.
