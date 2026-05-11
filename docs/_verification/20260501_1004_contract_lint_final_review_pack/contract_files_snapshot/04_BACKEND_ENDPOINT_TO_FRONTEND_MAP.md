# Backend Endpoint to Frontend Map

This file provides the inverse mapping: backend endpoints → frontend screens/actions.

| Backend Endpoint | Frontend Consumer |
|---|---|
| `GET /api/frameworks/` | Smoke test + project create flow (`/projects`) |
| `GET/POST /api/projects/` | `/projects` |
| `POST /api/projects/<id>/initialize-from-framework/` | First-project flow (`/projects/[id]`) |
| `GET /api/admin/frameworks/<id>/classification/` | `/admin/frameworks/classification` |
| `POST /api/admin/frameworks/<id>/classify-indicators/` | “Run AI Classification” button |
| `PATCH /api/admin/indicators/<indicator_id>/classification/` | “Save row” |
| `POST /api/admin/frameworks/<id>/classification/bulk-review/` | “Approve Selected” |
| `GET /api/admin/queues/document-generation/` | `/admin/queues/document-generation` |
| `POST /api/admin/queues/document-generation/<indicator_id>/generate-draft/` | Draft generation modal |
| `GET/PATCH /api/admin/document-drafts/<id>/` | `/admin/document-drafts/[id]` |
| `POST /api/admin/document-drafts/<id>/promote-to-evidence/` | Promote modal/action |
| `GET /api/admin/ai/usage/` | `/admin/ai/usage` |
| `GET /api/admin/ai/health/` | `/admin/system-health` |
| `POST /api/admin/ai/test-connection/` | `/admin/system-health` |
| `GET /api/audit/` | `/admin/audit` |
