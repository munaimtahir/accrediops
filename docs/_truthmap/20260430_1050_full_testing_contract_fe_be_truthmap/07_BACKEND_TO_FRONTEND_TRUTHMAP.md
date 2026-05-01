# Backend to Frontend Truthmap

## 1. Exposed through page
- **`GET /api/projects/`**: Mapped to `app/projects/page.tsx` (Projects List Screen).
- **`GET /api/frameworks/`**: Mapped to `app/admin/frameworks/page.tsx` (Admin Frameworks Screen).
- **`GET /api/indicators/{id}/`**: Mapped to `app/projects/{id}/indicators/{id}` (Indicator Detail Screen).
- **`GET /api/ai/classification/`**: Mapped to `app/admin/ai/classification/page.tsx`.

## 2. Exposed through button/action
- **`POST /api/indicators/{id}/assign/`**: Wired to the "Assign" action dialog in Indicator Detail Screen.
- **`POST /api/indicators/{id}/review/`**: Wired to "Submit for Review" button.
- **`POST /api/drafts/generate/`**: Wired to "Generate Draft" button in AI Action Center.
- **`POST /api/drafts/{id}/promote/`**: Wired to "Promote to Evidence" action in the Document Draft review modal.

## 3. Exposed through modal/drawer
- **`GET /api/indicators/{id}/details/`**: Exposed in the `indicator-drawer.tsx` component.
- **`GET /api/drafts/{id}/`**: Exposed in `admin-document-generation-queue-screen.tsx` (Document Draft Review UI).

## 4. Exposed through settings/admin screen
- **`GET /api/users/`**: Mapped to `app/admin/users/page.tsx`.
- **`GET /api/roles/`**: Mapped to `app/admin/roles/page.tsx`.
- **`GET /api/masters/`**: Mapped to `app/admin/masters/page.tsx` (Evidence categories, types, etc.).

## 5. Backend functions/endpoints with missing frontend exposure
- **`POST /api/frameworks/import/`**: Expected to be exposed in Frameworks Admin, but currently missing a fully working UI button/form for FMS framework import.
- **`POST /api/ai/sync_classifications/`**: Backend exists to re-sync classification data, but no explicit "Sync AI" button exists in the frontend Admin UI.
- **`GET /api/reports/lab-readiness/`**: Backend route exists but Lab/FMS readiness report is not yet exposed in the projects worklist or dashboard.

## Conclusion
The majority of core APIs have a corresponding UI exposure. The main gaps are related to advanced admin actions (Framework Import, AI Sync) and the new Lab/FMS reporting feature.