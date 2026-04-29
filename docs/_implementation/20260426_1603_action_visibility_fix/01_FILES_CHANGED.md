# Files Changed

| File | Area | Change |
|---|---|---|
| `backend/apps/workflow/permissions.py` | backend permissions | added boolean capability helpers that mirror existing `ensure_*` guards |
| `backend/apps/api/views/project_indicators.py` | backend indicator detail | passed `request` into serializer context |
| `backend/apps/api/serializers/project_indicators.py` | backend indicator detail | added `capabilities` payload to `ProjectIndicatorDetailSerializer` |
| `backend/apps/api/tests/test_governance_hardening.py` | backend tests | added assignment-aware capability matrix coverage |
| `frontend/types/index.ts` | frontend types | added `ProjectIndicatorCapabilities` and detail payload typing |
| `frontend/lib/authz.ts` | frontend authz | added `canManageClientProfiles`, `canExecuteOverrides`, and new restriction messages |
| `frontend/components/screens/indicator-drawer.tsx` | worklist drawer | added full-detail and AI CTAs; switched action gating to backend capabilities |
| `frontend/components/screens/indicator-detail-screen.tsx` | full indicator detail | switched action gating to backend capabilities; added `panel=ai`; removed duplicate `Return` flow |
| `frontend/components/screens/project-print-pack-screen.tsx` | page guard | restricted print-pack page for non-admin/non-lead |
| `frontend/components/screens/project-client-profile-screen.tsx` | page guard | restricted project client-profile page for non-admin/non-lead |
| `frontend/components/screens/admin-overrides-screen.tsx` | page guard | made lead view read-only and hid execution controls |
| `frontend/tests/e2e/13_role_visibility_and_authorization.spec.ts` | e2e | added print-pack, client-profile, and lead override visibility checks |
| `frontend/tests/e2e/16_action_visibility_fix.spec.ts` | e2e | added worklist drawer to AI Action Center discoverability test |
