# Frontend to Backend Truthmap

## 1. Correctly wired
- **Login Form (`login-screen.tsx`)**: Calls `POST /api/auth/login/`. Correct payload and response handling.
- **Project List (`projects-list-screen.tsx`)**: Calls `GET /api/projects/`.
- **Indicator Detail (`indicator-detail-screen.tsx`)**: Calls `GET /api/indicators/{id}/`.
- **Document Draft Queue (`admin-document-generation-queue-screen.tsx`)**: Calls `GET /api/drafts/` and `GET /api/drafts/{id}/` (Though currently suffering from a TS build error).

## 2. Calls wrong endpoint or missing API
- **AI Classification Filter (`admin-frameworks-screen.tsx`)**: The filter attempts to fetch AI classifications live via a filter parameter instead of using saved fields, violating the "Filters use saved fields, not live AI calls" architectural rule.

## 3. UI visible but no API call
- **Print Pack Export (`project-print-pack-screen.tsx`)**: UI form exists, but the "Generate PDF" action does not yet wire to a functioning backend `POST /api/exports/pdf/` endpoint. It only logs to the console or uses a stub.

## 4. Hidden incorrectly due to permission logic
- **Assign Indicator Action**: The "Assign" button is currently hidden for users with the `PROJECT_MANAGER` role on the `indicator-action-dialog.tsx` due to a mismatch between frontend RBAC checks and backend permissions.

## 5. Frontend actions without backend counterpart
- **Sync AI Action (Sidebar)**: A mock link exists in the frontend sidebar for "Sync AI Metrics", but it does not call any existing backend API endpoint and appears to be an orphaned action.
- **Mock Demo Mode Toggle**: A toggle exists in settings to enable "Demo Mode" for AI, but it relies purely on local storage and doesn't update any backend user preference or configuration.

## Conclusion
Most core workflows are correctly wired. However, some advanced AI features and export actions are stubbed or violate architectural rules (like live AI filtering instead of using saved database state).