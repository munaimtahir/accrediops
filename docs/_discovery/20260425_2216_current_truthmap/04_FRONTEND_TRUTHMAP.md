# Frontend Truth Map

## A. Frontend Page Inventory

| Page/Route | Purpose | Uses API/Data Source | Role Visibility | Status |
|---|---|---|---|---|
| `/admin` | Admin dashboard. | Yes | Admin, Lead | COMPLETE |
| `/admin/frameworks` | Framework management. | Yes | Admin | COMPLETE |
| `/admin/masters/*` | Various master list management pages. | Yes | Admin | COMPLETE |
| `/projects` | List of all projects. | Yes | All | COMPLETE |
| `/projects/[projectId]` | Project dashboard / summary. | Yes | All | COMPLETE |
| `/projects/[projectId]/worklist` | Indicator worklist and filtering. | Yes | All | COMPLETE |
| `/projects/[projectId]/inspection` | Inspection view (Met indicators). | Yes | Approver/Admin | COMPLETE |
| `/projects/[projectId]/exports` | Export History. | Yes | Lead/Admin | COMPLETE |
| `/projects/[projectId]/print-pack` | Print pack generation. | Yes | Lead/Admin | COMPLETE |
| `/projects/[projectId]/recurring` | Recurring tasks dashboard. | Yes | All | COMPLETE |
| `/project-indicators/[id]` | Indicator detail and actions. | Yes | All | COMPLETE |

## B. Frontend Feature Coverage

| Feature | UI Exists | Backend Connected | Status | Evidence |
|---|---|---|---|---|
| Dashboard summary cards | Yes | Yes | COMPLETE | `frontend/components/common/metric-card.tsx` |
| Indicator search/filter | Yes | Yes | COMPLETE | `filter-bar.tsx` |
| Indicator list | Yes | Yes | COMPLETE | `worklist/indicator-status-tile.tsx` |
| Indicator detail page | Yes | Yes | COMPLETE | `indicator-detail-screen.tsx` |
| Status update control | Yes | Yes | COMPLETE | `working-state-form.tsx` |
| Owner assignment UI | Yes | Yes | COMPLETE | `assignment-form.tsx` |
| Evidence link UI | Yes | Yes | COMPLETE | `evidence-form.tsx` |
| Action Center / AI | Yes | Yes | COMPLETE | `ai-actions` integration |
| Review workflow UI | Yes | Yes | COMPLETE | `evidence-review-form.tsx` |
| Reports/export UI | Yes | Yes | COMPLETE | `project-print-pack-screen.tsx` |
| Master list/settings UI | Yes | Yes | COMPLETE | `admin-masters-screen.tsx` |
| Existing accreditation module | Yes | Yes | COMPLETE | Generic frameworks loaded into `Frameworks`. |
| Laboratory/FMS UI | No | No | UNKNOWN | Distinct UI for FMS is not visible. |
