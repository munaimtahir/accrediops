# 01_FILES_CHANGED.md

The following files were modified or created during the stabilization sprint:

## Frontend Components
- `frontend/app/globals.css`: Added global focus ring and skip-link styles.
- `frontend/app/layout.tsx`: Added skip-to-main-content link in `RootLayout`.
- `frontend/components/layout/app-shell.tsx`: Removed redundant skip link; ensured `#main-content` target is correctly placed.
- `frontend/components/screens/login-screen.tsx`: Added `#main-content` target for accessibility.
- `frontend/components/forms/indicator-action-dialog.tsx`: Improved label/ID associations for accessibility.
- `frontend/components/screens/indicator-drawer.tsx`: Improved label/ID associations and styling for textareas.
- `frontend/components/screens/indicator-classification-screen.tsx`: Improved filter labels and added aria-labels to selection checkboxes.

## E2E Tests
- `frontend/tests/e2e/20_indicator_classification_workflow.spec.ts`: Fixed strict mode violation and stabilized selection logic.
- `frontend/tests/e2e/19_accessibility.spec.ts`: Added classification route accessibility tests and updated skip link tests.
