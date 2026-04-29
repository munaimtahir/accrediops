# Files Changed

## Backend

- `backend/apps/masters/choices.py` - added locked classification enums and updated indicator evidence type choices.
- `backend/apps/indicators/models/indicator.py` - added indicator-level classification fields.
- `backend/apps/indicators/migrations/0003_indicator_ai_assistance_level_and_more.py` - added schema migration and legacy evidence type mapping.
- `backend/apps/ai_actions/services/classification_prompts.py` - added structured classification prompt builder.
- `backend/apps/ai_actions/services/classification.py` - added Gemini-backed batch classification service, parsing, safe fallbacks, and overwrite policy.
- `backend/apps/api/serializers/admin.py` - added classification list/update/run/bulk serializers.
- `backend/apps/api/serializers/project_indicators.py` - exposed indicator classification fields on project indicator and worklist serializers.
- `backend/apps/api/views/admin.py` - added classification list, run, row update, and bulk review endpoints.
- `backend/apps/api/views/dashboard.py` - added saved classification filters to the worklist query.
- `backend/apps/api/views/frameworks.py` - updated framework analysis document count for the new evidence type code.
- `backend/apps/api/urls.py` - registered classification endpoints.
- `backend/apps/frameworks/services.py` - updated import/template defaults to locked evidence type codes.
- `backend/apps/projects/management/commands/reset_lab_state.py` - updated seed default to locked evidence type code.
- `backend/apps/api/tests/base.py` - updated test fixtures to locked evidence type codes.
- `backend/apps/api/tests/test_indicator_classification.py` - added backend classification tests.

## Frontend

- `frontend/types/index.ts` - added classification types and response interfaces.
- `frontend/lib/hooks/query-keys.ts` - added classification query key.
- `frontend/lib/hooks/use-indicator-classification.ts` - added classification query/mutation hooks.
- `frontend/components/screens/indicator-classification-screen.tsx` - added review/edit/run classification screen.
- `frontend/app/(workbench)/admin/frameworks/classification/page.tsx` - added admin route.
- `frontend/components/screens/admin-frameworks-screen.tsx` - added classification entry points and import-success prompt.
- `frontend/app/(workbench)/admin/page.tsx` - added Framework Setup link.
- `frontend/tests/e2e/20_indicator_classification_workflow.spec.ts` - added mocked Playwright workflow spec.

## Documentation

- `docs/_implementation/20260428_1311_ai_indicator_classification/*`
- `OUT/ai_indicator_classification_latest.md`
