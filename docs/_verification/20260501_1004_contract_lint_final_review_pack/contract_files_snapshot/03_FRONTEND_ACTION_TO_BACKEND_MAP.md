# Frontend Action to Backend Map

This file maps user actions (buttons/forms) to backend endpoints.

| Frontend Action | Screen | Backend Endpoint(s) |
|---|---|---|
| Sign in | `/login` | `POST /api/auth/login/` |
| Create project | `/projects` | `POST /api/projects/` |
| Initialize project from framework | `/projects/[projectId]` | `POST /api/projects/<id>/initialize-from-framework/` |
| Clone project | `/projects/[projectId]` | `POST /api/projects/<id>/clone/` |
| Assign PI roles | `/project-indicators/[id]` | `POST /api/project-indicators/<id>/assign/` |
| Update PI notes | `/project-indicators/[id]` | `POST /api/project-indicators/<id>/update-working-state/` |
| Start PI | `/project-indicators/[id]` | `POST /api/project-indicators/<id>/start/` |
| Send PI for review | `/project-indicators/[id]` | `POST /api/project-indicators/<id>/send-for-review/` |
| Mark PI met | `/project-indicators/[id]` | `POST /api/project-indicators/<id>/mark-met/` |
| Reopen PI | `/project-indicators/[id]` | `POST /api/project-indicators/<id>/reopen/` |
| Create evidence | PI detail | `POST /api/evidence/` |
| Review evidence | PI detail | `POST /api/evidence/<id>/review/` |
| Run AI classification | `/admin/frameworks/classification` | `POST /api/admin/frameworks/<id>/classify-indicators/` |
| Save classification row | `/admin/frameworks/classification` | `PATCH /api/admin/indicators/<indicator_id>/classification/` |
| Approve selected classifications | `/admin/frameworks/classification` | `POST /api/admin/frameworks/<id>/classification/bulk-review/` |
| Generate document draft | `/admin/queues/document-generation` | `POST /api/admin/queues/document-generation/<indicator_id>/generate-draft/` |
| Edit draft content/title | `/admin/document-drafts/[id]` | `PATCH /api/admin/document-drafts/<id>/` |
| Promote draft to evidence | `/admin/document-drafts/[id]` | `POST /api/admin/document-drafts/<id>/promote-to-evidence/` |
| View AI usage logs | `/admin/ai/usage` | `GET /api/admin/ai/usage/` |
| Test AI connection | `/admin/system-health` | `POST /api/admin/ai/test-connection/` |
| Reset user password | `/admin/users` | `POST /api/admin/users/<id>/password/` |
