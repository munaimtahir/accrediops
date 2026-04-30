# Files Changed

## Backend
- `backend/apps/projects/management/commands/reset_lab_state.py`: Implemented safe clean-slate logic, including `--dry-run`, `--confirm`, and `--reset-classifications` arguments.
- `backend/apps/projects/tests/test_reset_lab_state.py`: Created robust unit tests validating the safe functionality of the `reset_lab_state` command under various execution scenarios.
- `backend/apps/masters/management/commands/seed_master_data.py`: Added seed script for ensuring all dropdown menus/choices are database-backed.

## Frontend
- `frontend/components/screens/admin-document-generation-queue-screen.tsx`: Fixed ReactNode syntax, missing typings (`unknown as DocumentDraft`), and incorrect boolean conditions `{Boolean(row.latest_draft) && (` that were failing the Next.js production build.
- `frontend/components/screens/document-draft-review-screen.tsx`: Added missing `Modal` and `Card` UI component imports, and corrected the location of the `"use client"` directive.
- `frontend/tests/e2e/20_indicator_classification_workflow.spec.ts`: Updated legacy button name selectors to fix E2E suite mismatches.
