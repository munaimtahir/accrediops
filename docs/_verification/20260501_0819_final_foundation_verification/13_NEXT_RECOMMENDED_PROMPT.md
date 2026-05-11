# Next Recommended Prompt

Ready-to-paste prompt for the next sprint, based only on verified gaps discovered in this verification pass.

You are working inside the AccrediOps / Accreditation Dashboard repository.

Your task is a focused “contract completion + lint gate” sprint based on verified gaps from `docs/_verification/20260501_0819_final_foundation_verification/`.

Constraints:
- Do not add new product features.
- Focus on documentation/verification gates and low-risk cleanup only.

Goals (must do):
1. Complete the contract mapping docs under `docs/_contracts/20260430_2003_frontend_backend_contract_update/`:
   - Populate:
     - `01_API_ROUTE_CONTRACT.md`
     - `02_FRONTEND_SCREEN_CONTRACT.md`
     - `03_FRONTEND_ACTION_TO_BACKEND_MAP.md`
     - `04_BACKEND_ENDPOINT_TO_FRONTEND_MAP.md`
     - `06_RBAC_CAPABILITY_CONTRACT.md`
     - `07_STATUS_WORKFLOW_CONTRACT.md`
     - `08_TESTING_CONTRACT.md`
     - `INDEX.md`
   - Sources of truth:
     - Backend routes: `backend/apps/api/urls.py`
     - Frontend routes/screens: `frontend` app routes and the Next build route list.
2. Make `npm run lint` non-interactive and runnable in CI:
   - Either add a minimal ESLint config (recommended) or migrate to ESLint CLI per Next guidance, but ensure `npm run lint` exits non-zero on lint errors and does not prompt.
3. (Optional, if time) Reduce high-risk TS debt in document drafting screens without changing behavior:
   - Replace `useMemo` side effects with `useEffect` in `frontend/components/screens/document-draft-review-screen.tsx`.
   - Remove hard-coded `/projects/1/...` link in `frontend/components/screens/admin-document-generation-queue-screen.tsx` or derive project id from real context.

Verification checklist (must provide evidence):
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- Update contract docs and show that each is meaningfully populated (not heading-only).

Definition of done:
- Contract docs are usable for FE/BE drift review.
- Lint runs non-interactively.

