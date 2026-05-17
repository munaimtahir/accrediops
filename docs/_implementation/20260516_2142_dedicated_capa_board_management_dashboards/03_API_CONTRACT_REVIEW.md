# API Contract Review (Gap/CAPA)

Timestamp: 2026-05-16 21:42 UTC

## Mapping Table

| UI Need | Backend Endpoint | Exists? | Hook Exists? | Action |
|---|---|---:|---:|---|
| list all project CAPA | `GET /api/projects/:projectId/capas/` | Yes | No | Add `useProjectCapas` query hook; add backend query params for status/severity/etc. if needed |
| list open CAPA | `GET /api/projects/:projectId/capas/` (filter needed) | Partial | No | Add backend filtering: `status__in=OPEN,IN_PROGRESS` (and optionally SUBMITTED_FOR_REVIEW depending UX) |
| list my CAPA | `GET /api/projects/:projectId/capas/` (filter needed) | Partial | No | Add backend filtering: `responsible_person=:me` (or `responsible_person_id=`) |
| list overdue CAPA | `GET /api/projects/:projectId/capas/` (filter needed) | Partial | No | Add backend filtering: `overdue=true` (due_date < today and active statuses) |
| list export-blocking CAPA | `GET /api/projects/:projectId/capas/` (filter needed) | Partial | No | Add backend filtering: `export_blocker=true` using existing readiness blocker criteria (mandatory evidence OR high severity) |
| list closed CAPA | `GET /api/projects/:projectId/capas/` (filter needed) | Partial | No | Add backend filtering: `status=CLOSED` |
| get CAPA summary counts | `GET /api/projects/:projectId/capa-summary/` | Yes | No | Add `useProjectCapaSummary` hook; extend summary fields to include board buckets + export_blocker + assigned_to_me if needed |
| update CAPA | `PATCH /api/capas/:capaId/` | Yes | No | Add `useUpdateCapa` mutation hook (or extend existing mutations file) and invalidate relevant queries |
| submit CAPA | `POST /api/capas/:capaId/action/` (`{action:\"SUBMIT\"}`) | Yes | Yes (`useCapaAction`) | Reuse existing mutation; ensure capability gating in UI |
| close CAPA | `POST /api/capas/:capaId/action/` (`{action:\"CLOSE\"}`) | Yes | Yes (`useCapaAction`) | Reuse existing mutation; require closure notes/evidence input if needed |
| reject CAPA | `POST /api/capas/:capaId/action/` (`{action:\"REJECT\"}`) | Yes | Yes (`useCapaAction`) | Reuse existing mutation; require rejection reason |
| navigate to linked indicator/evidence requirement | indicator: `/project-indicators/:projectIndicatorId` | Yes | N/A | Use `project_indicator` on CAPA to link; evidence requirement is not a dedicated route today (panel anchor via `?panel=requiredEvidence`) |

## Notes
- Prefer existing endpoints and frontend hooks.
- Add minimal backend support only if dashboard queries cannot be expressed with existing endpoints and parameters.

## Current Contract Snapshot (What Exists Today)

Backend (Django REST):
- List CAPAs for a project: `GET /api/projects/:projectId/capas/` (no query-param filters currently).
- Summary counts: `GET /api/projects/:projectId/capa-summary/` (counts only: total/open/submitted/closed/high-risk/overdue).
- Update single CAPA: `GET|PATCH|PUT /api/capas/:capaId/`.
- Actions: `POST /api/capas/:capaId/action/` with `SUBMIT|CLOSE|REJECT`.
- Create CAPA from Gap: `POST /api/gaps/:gapId/capas/`.
- List/create gaps for a project evidence requirement: `GET|POST /api/project-evidence-requirements/:requirementId/gaps/`.

Frontend (Next.js + React Query):
- Mutations exist for record gap / initialize CAPA / action submit-close-reject in `frontend/lib/hooks/use-mutations.ts`.
- No CAPA list or CAPA summary query hooks exist yet (will be added for the dashboard/board).

