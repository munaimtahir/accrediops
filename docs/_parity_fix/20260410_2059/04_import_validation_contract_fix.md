# 04 Import Validation Contract Fix

> Historical parity snapshot: contract findings remain valid; runtime port has since been reassigned to `18080`.

## Contract parity target
Backend expects:
- Content type: `multipart/form-data`
- Fields:
  - `project_id`
  - `file`

Legacy frontend drift in this flow previously sent JSON (`{ file_name, rows }`), which no longer matched backend contract.

## Fix implemented
**Status:** PASS

The validate-framework request path now builds and submits `FormData` and lets the browser set multipart boundaries.

**Files**
- `frontend/lib/hooks/use-admin.ts`
- `frontend/lib/framework-import.ts`
- `frontend/components/screens/admin-import-logs-screen.tsx`
- `frontend/lib/hooks/use-framework-management.ts`

## UI/UX behavior aligned
- Validate disabled until both project and file are provided.
- Inline reason shown when action is disabled.
- Structured success state rendering added.
- Structured error state rendering added.
- Dead legacy JSON validation path removed from this screen-level flow.

## Validation coverage added/updated
- `frontend/tests/use-admin.test.tsx`
- `frontend/tests/admin-import-logs-screen.test.tsx`
- `frontend/tests/e2e/admin-import-validation.spec.ts`
