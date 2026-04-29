# API and Route Truth Map

## A. API Route Inventory (Excerpt)

| Method | Path | View/Handler | Purpose | Auth Required | Status |
|---|---|---|---|---|---|
| GET/POST | `/api/auth/session/` | `AuthSessionView` | Session state | Yes | COMPLETE |
| GET/POST | `/api/projects/` | `ProjectListCreateView` | Project List/Create | Yes | COMPLETE |
| GET | `/api/dashboard/worklist/` | `DashboardWorklistView` | Worklist View | Yes | COMPLETE |
| POST | `/api/projects/<id>/initialize-from-framework/` | `ProjectInitializeFromFrameworkView` | Clone from Framework | Yes | COMPLETE |
| GET | `/api/projects/<id>/inspection-view/` | `ProjectInspectionView` | Pre-inspection met list | Yes | COMPLETE |
| GET/PATCH | `/api/project-indicators/<id>/` | `ProjectIndicatorDetailView` | Detail | Yes | COMPLETE |
| POST | `/api/project-indicators/<id>/assign/` | `ProjectIndicatorAssignView` | Assign Owner | Yes | COMPLETE |
| POST | `/api/project-indicators/<id>/update-working-state/` | `ProjectIndicatorUpdateWorkingStateView` | Workflow state transition | Yes | COMPLETE |
| POST | `/api/project-indicators/<id>/send-for-review/` | `ProjectIndicatorSendForReviewView` | Submit review | Yes | COMPLETE |
| POST | `/api/project-indicators/<id>/mark-met/` | `ProjectIndicatorMarkMetView` | Final Approval | Yes | COMPLETE |
| GET/POST | `/api/evidence/` | `EvidenceCreateView` | Add evidence | Yes | COMPLETE |
| POST | `/api/ai/generate/` | `AIGenerateView` | AI Prompt Generation | Yes | COMPLETE |

## B. API Feature Coverage

| Feature | Required API | Existing API | Status | Gap |
|---|---|---|---|---|
| Indicator list | Yes | Yes | COMPLETE | None |
| Indicator detail | Yes | Yes | COMPLETE | None |
| Indicator status update | Yes | Yes | COMPLETE | None |
| Evidence add/update | Yes | Yes | COMPLETE | None |
| Owner assignment | Yes | Yes | COMPLETE | None |
| Reviewer action | Yes | Yes | COMPLETE | None |
| Approver action | Yes | Yes | COMPLETE | None |
| Document generation prompt | Yes | Yes | COMPLETE | None |
| FMS Standards specific APIs | Yes | No | MISSING | No distinct endpoint if FMS needs different treatment. |
