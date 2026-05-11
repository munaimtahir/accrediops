# Service Workflow Verification

| Service Behavior | File(s) | Verified By | Status | Risk |
|---|---|---|---|---|
| Project initialization creates fulfillment rows from framework evidence requirements | `backend/apps/projects/services.py`, `backend/apps/indicators/services.py` | Code inspection and backend tests | PASS | Low |
| Duplicate initialization does not create duplicate fulfillment rows | `backend/apps/indicators/services.py` | `get_or_create` usage in initialization service | PASS | Low |
| Missing evidence remains missing | `backend/apps/indicators/services.py`, `backend/apps/evidence/services.py` | Readiness logic and status lifecycle | PASS | Low |
| Partial evidence remains partial | `backend/apps/indicators/models/indicator.py`, `backend/apps/indicators/services.py` | Requirement status model | PASS | Low |
| Submitted evidence requires human review | `backend/apps/evidence/services.py`, `backend/apps/api/views/evidence.py` | Service code | PASS | Low |
| Approved evidence contributes to readiness | `backend/apps/indicators/services.py`, `backend/apps/exports/services_admin.py` | Readiness calculations | PASS | Medium |
| Rejected evidence does not count as approved | `backend/apps/indicators/services.py`, `backend/apps/exports/services_admin.py` | Readiness calculations | PASS | Medium |
| Missing mandatory evidence prevents 100% readiness | `backend/apps/indicators/services.py` | Validation logic | PASS | Medium |
| AI suggestions do not mutate final compliance | `backend/apps/ai_actions/services/classification.py`, `backend/apps/ai_actions/models/evidence_requirement_suggestion.py` | Code inspection | PASS | Medium |
| Draft promotion preserves indicator/requirement linkage | `backend/apps/ai_actions/services/document_drafting.py` | Code inspection and targeted tests | PASS | Low |
| Evidence upload preserves indicator/requirement linkage | `backend/apps/evidence/services.py` | Code inspection | PASS | Low |
| Export/readiness uses framework area/standard ordering where available | `backend/apps/exports/services.py`, frontend print-pack/inspection screens | Code inspection | PASS | Low |
| CAPA is implemented or honestly documented as pending | `backend/apps/exports/services.py`, readiness/export code | Code inspection | NOT IMPLEMENTED | High |

### Notes

- The core fulfillment lifecycle is present and behaves as a governed workflow.
- The export/readiness services still contain placeholder logic that weakens confidence in the final handoff.
- The inspection view failure indicates the read-only inspection path is not yet reliable even though its dependency chain exists.

