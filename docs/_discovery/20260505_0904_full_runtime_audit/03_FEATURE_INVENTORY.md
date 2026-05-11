# Feature Inventory

| Feature / Module | Backend present? | Frontend present? | Tests present? | Runtime verified? | Status | Notes |
|---|---|---|---|---|---|---|
| Authentication/login/logout | Yes (`test_auth_api.py`) | Yes (`app/login`) | Yes | No | COMPLETE | Core auth flow appears established. |
| User management | Yes (Model `User`) | Yes | Yes | No | COMPLETE | Bound to `Department` and roles. |
| Roles | Yes | Yes | Yes | No | COMPLETE | |
| Permissions/RBAC | Yes (`permissions.py`) | Yes (`authz.test.ts`) | Yes | No | COMPLETE | Robust custom permission engine. |
| Framework creation/editing | Yes (`Framework`) | Yes | Yes | No | COMPLETE | |
| Framework-level indicator import | Yes (`ImportLog`) | Yes | Yes | No | COMPLETE | Bulk imports supported. |
| Framework-level indicator list | Yes | Yes | Yes | No | COMPLETE | |
| Framework-level AI classification | Yes (`AIUsageLog`) | Yes | Yes | No | COMPLETE | Prompts present in `ai_actions` |
| Indicator master fields | Yes (`Indicator`) | Yes | Yes | No | COMPLETE | Separated from project scope. |
| Evidence categories/types | Yes (`MasterValue`) | Yes | Yes | No | COMPLETE | Controlled vocabs through DB. |
| Project creation/editing | Yes (`Project`) | Yes (`project-management-form`)| Yes | No | COMPLETE | |
| Project linking to framework | Yes (`ProjectIndicator`) | Yes | Yes | No | COMPLETE | Instantiates templates for context. |
| Project-specific working indicators | Yes | Yes | Yes | No | COMPLETE | |
| Dashboard summary | Yes (`dashboard.py`) | Yes | Yes | No | COMPLETE | |
| Indicator worklist | Yes | Yes (`worklist-screen.tsx`) | Yes | No | COMPLETE | |
| Indicator detail page | Yes | Yes (`indicator-detail-screen.tsx`) | Yes | No | COMPLETE | Sidebar/drawer exists. |
| Evidence upload/linking | Yes (`EvidenceItem`) | Yes | Yes | No | COMPLETE | Supports files and text notes. |
| Evidence status tracking | Yes | Yes | Yes | No | COMPLETE | |
| Owner assignment | Yes (`ProjectIndicator`) | Yes | Yes | No | COMPLETE | |
| Reviewer workflow | Yes (`workflow` app) | Yes | Yes | No | COMPLETE | |
| Approver workflow | Yes | Yes | Yes | No | COMPLETE | |
| Submit workflow | Yes | Yes | Yes | No | COMPLETE | Tracked via `ProjectIndicatorStatusHistory` |
| Return/reopen workflow | Yes | Yes | Yes | No | COMPLETE | |
| Recurring evidence workflow | Yes (`RecurringRequirement`) | Yes (`recurring-screen.tsx`) | Yes | No | COMPLETE | Support scheduled collections. |
| Document drafting | Yes (`DocumentDraft`) | Yes | Yes | No | COMPLETE | AI generator -> Draft -> Evidence flow. |
| Promote draft to evidence | Yes (`promoted_evidence`) | Yes | Yes | No | COMPLETE | |
| AI Action Center | Yes | Yes | Yes | No | COMPLETE | |
| AI usage/audit log | Yes (`AIUsageLog`) | Yes | Yes | No | COMPLETE | |
| Admin/settings pages | Yes | Yes (`admin-dashboard-screen`) | Yes | No | COMPLETE | Includes registry/overrides. |
| Master data management | Yes (`MasterValue`) | Yes | Yes | No | COMPLETE | |
| Reports/export/print pack | Yes (`ExportJob`, `PrintPack`) | Yes (`print-pack-screen`) | Yes | No | COMPLETE | Output bundles for accrediting bodies. |
| Client/institution profile | Yes (`ClientProfile`) | Yes (`client-profile-form`) | Yes | No | COMPLETE | |
| Notifications/reminders | No explicit model | No explicit UI | No | No | MISSING | Not found in models or frontend code. |
| Health checks | Yes (`system.py`) | Yes (`app/healthz`) | Yes | No | COMPLETE | API connectivity endpoints. |
| API health checks | Yes | Yes | Yes | No | COMPLETE | |
| AI provider health/status check | Yes | Unknown | Yes | No | UNKNOWN | Might be part of system checks. |
| Playwright/E2E tests | Yes | Yes (`playwright.config.ts`) | Yes | No | COMPLETE | |
| Deployment scripts | Yes (`scripts/devops`) | Yes | Yes | No | COMPLETE | |
| Docker runtime | Yes (`docker-compose.yml`) | Yes | Yes | No | COMPLETE | |

**Initial Observations:** The foundation of the app is essentially COMPLETE. Nearly all expected modules map cleanly across both backend and frontend layers with corresponding tests.
