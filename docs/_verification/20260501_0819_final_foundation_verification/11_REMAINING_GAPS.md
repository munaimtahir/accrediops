# Remaining Gaps

Every gap includes: Gap ID, Title, Category, Severity, Evidence, Affected files, Recommended fix, Suggested verification command, Blocks GO.

## Gaps

### GAP-001 — Reset command test missing
- Category: Test gap
- Severity: High
- Evidence: `backend/apps/projects/tests/test_reset_lab_state.py` not found; reset behavior verified by runtime only.
- Affected files: `backend/apps/projects/management/commands/reset_lab_state.py`
- Recommended fix: add pytest coverage for flag gating, dry-run rollback, preserved framework counts, and classification reset option.
- Suggested verification command: `cd backend && pytest -k reset_lab_state`
- Blocks GO? No (runtime verification exists), but weakens safety guarantees.

### GAP-002 — Contract mapping documents are heading-only
- Category: Contract gap
- Severity: Critical
- Evidence: Heading-only files in `docs/_contracts/20260430_2003_frontend_backend_contract_update/` (`01`, `02`, `03`, `04`, `06`, `07`, `08`, `INDEX`).
- Affected files: contract folder listed above.
- Recommended fix: populate route tables, screen tables, action↔endpoint maps, RBAC capabilities, workflow statuses, and testing expectations; ensure they reflect `backend/apps/api/urls.py` and frontend routes.
- Suggested verification command: manual review + add a lightweight “contract completeness” CI check (even grep-based) to prevent regression.
- Blocks GO? Yes (contract is not usable for FE/BE drift prevention).

### GAP-003 — Frontend lint is blocked by interactive Next.js ESLint migration prompt
- Category: Documentation gap
- Severity: Medium
- Evidence: `npm run lint` launches interactive configuration prompt and exits non-zero in non-interactive environments.
- Affected files: `frontend/package.json` (script), missing ESLint config.
- Recommended fix: migrate to ESLint CLI or add an `.eslintrc` and non-interactive lint script.
- Suggested verification command: `cd frontend && npm run lint`
- Blocks GO? No (build/tests pass), but reduces gate quality.

### GAP-004 — Type-safety / correctness debt in document drafting screens
- Category: Type-safety gap
- Severity: High
- Evidence:
  - `frontend/components/screens/document-draft-review-screen.tsx` uses `useMemo` for side effects and `as any`.
  - `frontend/components/screens/admin-document-generation-queue-screen.tsx` uses `as any` and hard-coded project link `/projects/1/...`.
- Affected files:
  - `frontend/components/screens/document-draft-review-screen.tsx`
  - `frontend/components/screens/admin-document-generation-queue-screen.tsx`
- Recommended fix: replace `useMemo` side effects with `useEffect`; define proper TS types for API payloads; remove hard-coded project id and use real project context or hide link when unknown.
- Suggested verification command: `cd frontend && npm run build`
- Blocks GO? No (build passes), but risk for runtime correctness.

### GAP-005 — Moderate npm vulnerabilities reported
- Category: Runtime gap
- Severity: Low
- Evidence: `npm install` reports `2 moderate severity vulnerabilities`.
- Affected files: `frontend/package-lock.json`
- Recommended fix: run `npm audit` and apply minimal safe updates.
- Suggested verification command: `cd frontend && npm audit`
- Blocks GO? No.

