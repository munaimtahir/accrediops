# Next Recommended Prompt (GO → FMS Framework Import UI Sprint)

Ready-to-paste prompt:

---

You are working inside the AccrediOps / Accreditation Dashboard repository.

Sprint type: **FMS Framework Import UI Sprint**.

Constraints:
- Do not add unrelated product features.
- Keep changes focused on framework import UX + wiring + tests + contract updates.

Goals (must do):
1. Implement the Framework Import UI flow in the admin area:
   - Add an upload/import screen (or extend existing `admin/frameworks` screen) to upload an FMS framework file.
   - Add validation modal (preview summary, counts, blocking errors).
   - Add import execution action and show result summary.
2. Wire UI to backend import endpoint(s) documented in:
   - `docs/_contracts/20260430_2003_frontend_backend_contract_update/01_API_ROUTE_CONTRACT.md`
   - Backend source of truth: `backend/apps/api/urls.py` and corresponding view(s).
3. Add Playwright E2E coverage:
   - New E2E: “framework import happy path” (upload → validate → import → verify framework appears).
4. Update contract docs:
   - `01_API_ROUTE_CONTRACT.md`
   - `02_FRONTEND_SCREEN_CONTRACT.md`
   - `03_FRONTEND_ACTION_TO_BACKEND_MAP.md`
   - `04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md`
   - `08_TESTING_CONTRACT.md`
5. Keep verification gates green:
   - `python3 scripts/check_contract_docs.py`
   - `cd frontend && npm run lint`
   - `cd frontend && npm run build`

Evidence required in sprint output:
- Paste command outputs for the three gates above.
- Playwright run output for the new import test.

---
