# 09 Worklist 500 fix

## Code changes

1. **Backend pagination hardening**
   - File: `backend/apps/api/pagination.py`
   - Added `get_page_size` guard:
     - accepts `page_size=all` and maps to bounded max page size
     - falls back safely on invalid values
   - Increased `max_page_size` to 1000 for “show all” use.

2. **Backend regression coverage**
   - File: `backend/apps/api/tests/test_admin_readiness_inspection_exports.py`
   - Added test:
     - `test_worklist_accepts_show_all_page_size_without_server_error`

3. **Frontend worklist parity**
   - File: `frontend/components/screens/project-worklist-screen.tsx`
   - Added page-size selector including “Show all”.
   - URL-driven `page_size` behavior with `all` support.

4. **Type update**
   - File: `frontend/types/index.ts`
   - `WorklistFilters.page_size` now supports `number | "all"`.

## Result

- Worklist “show all” path is now stable and covered in both API and E2E flows.
