# 01_FILES_CHANGED.md

## Backend
- `apps/projects/management/commands/reset_lab_state.py`: Enhanced reset logic.
- `apps/masters/models.py`: Added `PolicyDecision`.
- `apps/masters/management/commands/seed_master_values.py`: Added master seeder.
- `apps/masters/management/commands/seed_policies.py`: Added policy seeder.
- `apps/ai_actions/models/ai_usage_log.py`: Added AI logging model.
- `apps/ai_actions/services/usage.py`: Centralized AI logging service.
- `apps/ai_actions/services/classification.py`: Integrated usage logging.
- `apps/ai_actions/services/generation.py`: Integrated usage logging; corrected actor handling.
- `apps/api/serializers/admin.py`: Added `AIUsageLogSerializer`; updated `UserAdminSerializer`.
- `apps/api/serializers/common.py`: Added `UserWriteSerializer` and `PasswordResetSerializer`.
- `apps/api/views/admin.py`: Added `AIUsageLogListView`, `DocumentGenerationQueueView`, `AdminUserPasswordResetView`; updated `FrameworkImport` views.
- `apps/api/views/system.py`: Added `AIHealthView`, `AITestConnectionView`.
- `apps/api/urls.py`: Mapped new admin and AI endpoints.
- `apps/api/tests/test_frameworks_api.py`: Updated for `framework_id`.
- `apps/api/tests/test_admin_readiness_inspection_exports.py`: Updated for `framework_id`.

## Frontend
- `lib/hooks/use-admin.ts`: Added `useAIUsage`, `useAIHealth`, `useTestAIConnection`, `useCreateAdminUser`, `useResetAdminUserPassword`, `useDocumentGenerationQueue`.
- `types/index.ts`: Updated import payload/result types.
- `components/common/settings-page-header.tsx`: Created new reusable header.
- `components/layout/sidebar.tsx`: Added AI Classification, AI Usage, and Document Queue links.
- `components/screens/admin-frameworks-screen.tsx`: Updated for framework-level import.
- `components/screens/admin-users-screen.tsx`: Implemented User CRUD and password reset.
- `components/screens/admin-ai-usage-screen.tsx`: Created AI usage and health dashboard.
- `components/screens/admin-document-generation-queue-screen.tsx`: Created initial queue foundation.
- `app/(workbench)/admin/ai/usage/page.tsx`: Route for AI Usage.
- `app/(workbench)/admin/queues/document-generation/page.tsx`: Route for Document Queue.
- `tests/*.test.tsx`: Updated and fixed 53 unit tests to match architecture changes.
