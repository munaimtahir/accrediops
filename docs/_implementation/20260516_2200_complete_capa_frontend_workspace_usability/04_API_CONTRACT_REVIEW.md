# API Contract Review

Based on the existing backend routing and models, we have the necessary API endpoints to support the frontend CAPA workspace. No new major backend models or views need to be constructed from scratch.

## API Mapping

| UI Action | Existing API Endpoint | Method | Status | Action Needed |
|---|---|---|---|---|
| List project gaps | `/api/projects/{project_id}/gaps/` | `GET` | ✅ Exists | Integrate in frontend `lib/api` |
| Create gap from requirement | `/api/project-evidence-requirements/{requirement_id}/gaps/` | `POST` | ✅ Exists | Integrate in frontend `lib/api` |
| List project CAPA | `/api/projects/{project_id}/capas/` | `GET` | ✅ Exists | Integrate in frontend `lib/api` |
| CAPA Summary dashboard | `/api/projects/{project_id}/capa-summary/` | `GET` | ✅ Exists | Integrate in frontend `lib/api` |
| Create CAPA from Gap | `/api/gaps/{gap_id}/capas/` | `POST` | ✅ Exists | Integrate in frontend `lib/api` |
| Update CAPA | `/api/capas/{pk}/` | `PATCH` | ✅ Exists | Integrate in frontend `lib/api` |
| Submit/Close/Reject CAPA | `/api/capas/{pk}/action/` | `POST` | ✅ Exists | Ensure payload accepts `{ "action": "SUBMIT|CLOSE|REJECT", "notes": "..." }` |
| Fetch CAPA detail | `/api/capas/{pk}/` | `GET` | ✅ Exists | Integrate in frontend `lib/api` |
| Fetch CAPA blockers | Handled by Readiness / Export blockers API? | `GET` | ✅ Supported via Readiness API | Verify readiness endpoint includes CAPA blockers. |

## Frontend Integration Strategy
1. **API Client (`lib/api.ts` or similar):**
   - We will need to export generic `SWR` hooks or helper functions to call the CAPA APIs.
2. **Capability Validation:**
   - The `/api/projects/{project_id}/indicators/` and other detail responses already return `capabilities` such as `can_create_capa`, `can_update_capa`, `can_close_capa`. We will rely on these to hide or disable buttons rather than hardcoding role logic on the client.
