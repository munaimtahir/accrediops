# Contract Gaps and Decisions

- **Contract Gap:** Frontend Print Pack UI exists, but backend API is missing/stubbed.
- **Type:** Frontend-only gap.
- **Severity:** High
- **Decision needed:** Should we implement PDF generation on the backend, or rely on browser printing?
- **Recommended action:** Implement `POST /api/exports/pdf/` endpoint and wire to UI.
- **Related files:** `project-print-pack-screen.tsx`, `backend/apps/api/views/exports.py`

- **Contract Gap:** AI Classification live filtering on Frameworks page.
- **Type:** Architecture gap.
- **Severity:** Medium
- **Decision needed:** Can we deprecate live AI classification in list filters?
- **Recommended action:** Yes. Filters must rely strictly on `ai_assistance_level` in DB.