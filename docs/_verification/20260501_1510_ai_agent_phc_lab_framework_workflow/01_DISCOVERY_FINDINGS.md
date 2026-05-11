# Discovery Findings — PHC LAB

## 1) Framework exists (exact name)
- Target name: `PHC LAB`
- Confirmed: Yes
- Evidence: `_discovery_backend_stats.txt`

## 2) PHC LAB framework ID
- Framework ID: 1
- Evidence: `_discovery_backend_stats.txt`

## 3) Framework structure counts
- Areas: 10
- Standards: 37
- Indicators: 118
- Recurring indicators: 44
- Evidence: `_discovery_backend_stats.txt`

## 4) Indicator field completeness (spot-checked via DB)
From `_discovery_backend_stats.txt` + follow-up inspection:
- Indicators have `code`: Yes (missing 0)
- Indicators have `text`: Yes (missing 0)
- Indicators have `area`/`standard`: Yes (missing 0)
- Indicators have `evidence_type`: Yes (missing 0)
- Indicators have `document_type`: Yes (missing 0)
- Indicators have `ai_assistance_level`: Yes (missing 0)
- Recurring indicators have `recurrence_frequency` + `recurrence_mode`: Yes (missing 0)

## 5) PHC LAB selectable for project creation
- Backend supports framework list (`GET /api/frameworks/`) and project creation (`POST /api/projects/`).
- Playwright workflow uses PHC LAB framework ID when creating the project.
- Evidence: Playwright spec `frontend/tests/e2e/30_phc_lab_framework_full_workflow.spec.ts`

## 6) Existing E2E seed command(s)
- Seed command used by Playwright global setup:
  - `backend/apps/projects/management/commands/seed_e2e_state.py`
- Note: This was adjusted in this sprint to target `PHC LAB` and to avoid deleting frameworks/indicators.

## 7) Test users and roles present
- Users observed (top 10): `admin`, `pw_admin`, `pw_lead`, `pw_owner`, `pw_reviewer`, `pw_approver`
- Roles: ADMIN/LEAD/OWNER/REVIEWER/APPROVER
- Evidence: `_discovery_backend_stats.txt`

## 8) Frontend routes relevant to workflow
From `frontend/app/(workbench)`:
- Frameworks:
  - `/admin/frameworks`
  - `/admin/frameworks/classification`
  - `/frameworks/[id]/analysis`
- Projects:
  - `/projects`
  - `/projects/[projectId]`
  - `/projects/[projectId]/worklist`
  - `/project-indicators/[id]`
  - `/projects/[projectId]/print-pack`
  - `/projects/[projectId]/exports`
- Admin document drafting:
  - `/admin/queues/document-generation`
  - `/admin/document-drafts/[id]`

## 9) Backend endpoints relevant to workflow
Source: `backend/apps/api/urls.py`
- Auth:
  - `POST /api/auth/login/`, `POST /api/auth/logout/`
- Frameworks:
  - `GET /api/frameworks/`
  - `GET /api/admin/frameworks/<framework_id>/classification/`
  - `POST /api/admin/indicators/<indicator_id>/classification/`
  - `POST /api/admin/frameworks/<framework_id>/classification/bulk-review/`
- Projects:
  - `POST /api/projects/`
  - `POST /api/projects/<project_id>/initialize-from-framework/`
  - `GET /api/dashboard/worklist/?project_id=<id>`
- Indicator operations:
  - `GET /api/project-indicators/<id>/`
  - `POST /api/project-indicators/<id>/update-working-state/`
  - `POST /api/project-indicators/<id>/start/`
  - `POST /api/project-indicators/<id>/send-for-review/`
  - `POST /api/project-indicators/<id>/mark-met/`
- Doc drafts:
  - `GET /api/admin/queues/document-generation/`
  - `POST /api/admin/indicators/<indicator_id>/document-drafts/generate/`
  - `GET /api/admin/document-drafts/`
  - `PATCH /api/admin/document-drafts/<id>/`
  - `POST /api/admin/document-drafts/<id>/promote-to-evidence/`
- Evidence:
  - `POST /api/evidence/`
  - `POST /api/evidence/<id>/review/`
