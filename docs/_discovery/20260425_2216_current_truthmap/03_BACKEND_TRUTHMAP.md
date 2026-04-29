# Backend Truth Map

## A. Backend Module Matrix

| Module/App | Purpose | Status | Evidence | Notes |
|---|---|---|---|---|
| `accounts` | User models, ClientProfile, Departments. | COMPLETE | `User`, `Department`, `ClientProfile` models exist. | Custom user model implemented. |
| `ai_actions` | AI prompt generation and output tracking. | COMPLETE | `GeneratedOutput` model, `AIGenerateView`. | Acts as advisory, not system of record. |
| `api` | DRF configuration, serializers, and routing. | COMPLETE | `urls.py`, `serializers/`, `views/`. | Consolidates API endpoints cleanly. |
| `audit` | Centralized audit log. | COMPLETE | `AuditEvent` model, `AuditLogView`. | |
| `evidence` | Evidence item management. | COMPLETE | `EvidenceItem` model. | |
| `exports` | Handing generation of export docs/files. | COMPLETE | `PrintPackItem`, `ExportJob`, `ImportLog`. | Connects to Print Pack generation. |
| `frameworks`| Core accreditation framework definition. | COMPLETE | `Framework`, `Area`, `Standard` models. | |
| `indicators`| Core indicators and project-specific state. | COMPLETE | `Indicator`, `ProjectIndicator`, `StatusHistory`. | Contains critical transition logic in model save. |
| `masters` | Master values (settings, types, statuses). | COMPLETE | `MasterValue` model. | |
| `projects` | Project tracking and initialization. | COMPLETE | `AccreditationProject` model. | |
| `recurring` | Recurring item tracking. | COMPLETE | `RecurringRequirement`, `RecurringEvidenceInstance`. | |
| `workflow` | Permissions and transition guards. | COMPLETE | `workflow_transition_is_allowed` used in `ProjectIndicator.save`. | |

## B. Backend Feature Matrix

| Feature | Model Exists | API Exists | Service Logic Exists | Permission Exists | Tests Exist | Status |
|---|---|---|---|---|---|---|
| Frameworks | Yes | Yes | Yes | Yes | Yes | COMPLETE |
| Indicator Registry | Yes | Yes | Yes | Yes | Yes | COMPLETE |
| Project Initialization | Yes | Yes | Yes | Yes | Yes | COMPLETE |
| Status Transitions | Yes | Yes | Yes | Yes | Yes | COMPLETE |
| Action Center (AI) | Yes | Yes | Yes | Yes | Yes | COMPLETE |
| Print Pack Export | Yes | Yes | Yes | Yes | Yes | COMPLETE |
| User Management | Yes | Yes | Yes | Yes | Yes | COMPLETE |

## C. Backend Risk List

| Risk | Severity | Evidence | Why it matters | Suggested fix phase |
|---|---|---|---|---|
| File Storage Config | Medium | `EvidenceItem.file_or_url` exists. | No explicit cloud blob storage configured. | Phase 6 |
| FMS Separation | High | Missing distinct lab models. | FMS/Lab standards might need distinct models or mapping vs general framework. | Phase 3 |
| Notification Logic | Medium | Missing celery/redis/email setup. | Approver/reviewer notifications won't trigger without tasks. | Phase 5 |
