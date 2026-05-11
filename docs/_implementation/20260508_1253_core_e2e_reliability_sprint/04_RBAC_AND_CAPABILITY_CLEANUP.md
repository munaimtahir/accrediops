# Phase 4 — RBAC and Capability Visibility Cleanup

## Verification Matrix

| Role | Page/action | Backend allowed? | Frontend visible? | Expected? | Fix |
|---|---|---|---|---|---|
| Admin | All | Yes | Yes | Yes | N/A |
| Lead | Admin area | Yes | Yes | Yes | N/A |
| Owner | Project creation | No | No (button disabled) | Yes | N/A |
| Owner | Start/Review | Yes (if assigned) | Yes (if assigned) | Yes | N/A |
| Owner | Mark Met | No | No (button disabled) | Yes | N/A |
| Owner | Reopen | No | No (button disabled) | Yes | N/A |
| Reviewer | Evidence Review | Yes (if assigned) | Yes (if assigned) | Yes | N/A |
| Approver | Mark Met | Yes (if assigned) | Yes (if assigned) | Yes | N/A |

## Findings
- **Backend/Frontend Alignment**: Capability flags in `ProjectIndicatorSerializer` correctly map to `IndicatorDrawer` and `IndicatorDetailScreen` buttons.
- **Blocking**: Backend views in `backend/apps/api/views/project_indicators.py` strictly enforce role-based access using `apps.workflow.permissions`.
- **Navigation**: Sidebar correctly hides "Admin" and "AI Classification" sections for non-Admin/Lead users.
- **Discoverability**: CTA buttons (like "Generate Print Pack") remain visible but disabled for unauthorized users, providing clear rationale in the `title` attribute.

## Files Updated
- None required (already correctly implemented).
