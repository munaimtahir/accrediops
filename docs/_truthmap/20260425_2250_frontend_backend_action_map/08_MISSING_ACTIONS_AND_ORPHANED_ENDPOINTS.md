# Missing Actions And Orphaned Endpoints

## 1. Frontend actions with no backend

| Gap ID | Type | Area | Description | Evidence | Severity | Recommended Fix |
|---|---|---|---|---|---|---|
| GAP-01 | FRONTEND_ONLY | Pending Actions | `Print actionable list` uses `window.print()` only | `project-pending-actions-screen.tsx:45-47` | low | none unless print audit/history is needed |
| GAP-02 | FRONTEND_ONLY | Projects | `Show/Hide power table` is local-only presentation | `projects-list-screen.tsx:183-217` | low | none |
| GAP-03 | FRONTEND_ONLY | Indicator Detail | panel tab buttons (`AI / Assist`, `Evidence`, etc.) are local UI state only | `indicator-detail-screen.tsx:358-371` | low | none |

## 2. Backend endpoints with no frontend

| Gap ID | Type | Area | Description | Evidence | Severity | Recommended Fix |
|---|---|---|---|---|---|---|
| GAP-04 | BACKEND_ONLY | Admin Masters | `PATCH /api/admin/masters/<key>/<pk>/` exists but no visible edit control uses it | backend `admin.py:63-72`; frontend `admin-masters-screen.tsx:13-52` | medium | add row edit UI or remove endpoint from completion claims |

## 3. Existing frontend components not mounted anywhere relevant to the feature claim

| Gap ID | Type | Area | Description | Evidence | Severity | Recommended Fix |
|---|---|---|---|---|---|---|
| GAP-05 | INVISIBLE_UI | AI | AI controls exist only in full indicator detail page, not in primary worklist drawer path | `project-worklist-screen.tsx:383-423`, `indicator-drawer.tsx:301-311`, `indicator-detail-screen.tsx:858-939` | high | expose AI from primary operator path |
| GAP-06 | INVISIBLE_UI | Indicator Detail Route | full detail route is mounted but not linked from primary worklist cards | `indicator-status-tile.tsx:15-18`, no `/project-indicators/` link in worklist/workspace | high | add explicit "Open detail" link/button |

## 4. Expected product actions missing completely

| Gap ID | Type | Area | Description | Evidence | Severity | Recommended Fix |
|---|---|---|---|---|---|---|
| GAP-07 | MISSING | Indicator Comments | no add note/comment API or visible comment submission UI; only working notes update exists | backend has comment model/service but no API URL; detail only shows embedded comments | high | add comments API + UI or de-scope comments explicitly |
| GAP-08 | MISSING | Evidence | no evidence delete endpoint or visible delete action | no `DELETE /api/evidence/:id` endpoint; no delete UI | medium | add delete/archive flow if product requires evidence lifecycle completeness |
| GAP-09 | MISSING | AI Center | no standalone visible `AI Action Center` route/button/card in nav | no route or nav item | high | add discoverable entry point if feature is product requirement |
| GAP-10 | MISSING | Lab/FMS | no FMS-specific route/module naming; LAB exists as framework seed, not as separate module surface | `LAB` only appears in framework data/seed commands and e2e fixtures | medium | clarify whether Lab/FMS means framework content or separate product module |
| GAP-11 | MISSING | Status History API | no dedicated status-history endpoint despite required audit-style use case | detail serializer embeds `status_history`; no API route | medium | add dedicated endpoint only if separate querying/export is needed |
| GAP-12 | MISSING | Export History Download | export history shows metadata but no visible download/open action per history row | `project-export-history-screen.tsx:186-200` | medium | add history row action if exported files/artifacts are meant to be retrieved |
| GAP-13 | MISSING | AI Previous Outputs Navigation | previous outputs are visible only inside detail AI panel, not listed elsewhere | `indicator-detail-screen.tsx:894-931` | medium | add AI history entry point if product requires centralized AI history |

## Expected product actions specifically checked

| Product Action | Truth |
|---|---|
| Dashboard open | implemented via projects/project overview/worklist surfaces |
| Filter worklist | implemented |
| View high-risk indicators | partially implemented through readiness/inspection blocker summaries, not a dedicated high-risk page |
| Create/import framework | implemented in admin |
| View standards | implemented |
| Initialize project from framework | implemented |
| Create project | implemented |
| Open project dashboard | implemented |
| Open worklist | implemented |
| Filter indicators | implemented |
| Open indicator detail | partially implemented; full detail not linked from primary worklist |
| Assign owner | implemented |
| Update priority/due date/working state | implemented |
| Add evidence link/note | implemented as evidence create/update |
| Add note/comment | missing comment flow; only working notes exist |
| View status history | implemented as embedded read-only detail section |
| Send for review | implemented |
| Reviewer approve/return | evidence review yes; indicator "return" is actually admin reopen, not reviewer return workflow |
| Approver mark met/final | implemented |
| Generate AI action plan/gap review/SOP prompt | implemented as guidance/draft/assessment variants on detail page only |
| Save generated output | implemented |
| View previous generated outputs | implemented inside indicator detail only |
| Export Excel | implemented |
| Generate print pack | implemented |
| View export history | implemented |
| Download output | preview payloads exist; history row download action missing |
| Manage users/roles | implemented |
| Manage masters | add/list implemented; edit missing in UI |
| Manage domains/evidence types/statuses | add/list implemented via masters |
