# Gap Register

## GAP-001: Frontend Build Failure (Type Error)
- **Type:** Frontend-only gap
- **Severity:** Critical
- **Evidence:** `npm run build` fails with `Type error: Conversion of type 'Record<string, unknown>[]' to type 'DocumentDraft[]' may be a mistake`.
- **Affected files:** `frontend/components/screens/admin-document-generation-queue-screen.tsx`
- **User impact:** Prevents production builds and completely blocks Playwright E2E testing.
- **Recommended fix:** Fix TypeScript assertions or align the API response type definition with the component's expectations.
- **Suggested test:** `npm run build` passes.
- **Blocks GO/NO-GO:** YES

## GAP-002: Backend Syntax Error in Tests
- **Type:** Testing gap
- **Severity:** High
- **Evidence:** `pytest` fails with `SyntaxError: invalid syntax` on line 116.
- **Affected files:** `backend/apps/indicators/tests/test_services.py`
- **User impact:** Prevents running automated backend tests, making it unsafe to refactor core logic.
- **Recommended fix:** Correct the unclosed parenthesis in the preceding function call in the test file.
- **Suggested test:** `pytest` passes.
- **Blocks GO/NO-GO:** YES

## GAP-003: AI Classification Filter Uses Live API
- **Type:** Architecture gap
- **Severity:** Medium
- **Evidence:** Admin frameworks screen attempts to fetch AI classifications live via filter parameters.
- **Affected files:** `frontend/components/screens/admin-frameworks-screen.tsx`
- **User impact:** Unnecessary API costs, violates architectural doctrine.
- **Recommended fix:** Update filter logic to rely on the stored `ai_assistance_level` database field.
- **Suggested test:** Verify network tab on filter change; no call to AI provider should occur.
- **Blocks GO/NO-GO:** NO

## GAP-004: FMS Import Lacks UI Exposure
- **Type:** Frontend-only gap
- **Severity:** High
- **Evidence:** `POST /api/frameworks/import/` endpoint exists but has no frontend UI.
- **Affected files:** `backend/apps/api/views/frameworks.py`
- **User impact:** Non-engineers cannot upload or import the Lab/FMS framework data.
- **Recommended fix:** Implement an import button/modal on the Frameworks Admin screen.
- **Suggested test:** Playwright test verifying successful FMS CSV/JSON upload.
- **Blocks GO/NO-GO:** NO (Feature development, not a regression).