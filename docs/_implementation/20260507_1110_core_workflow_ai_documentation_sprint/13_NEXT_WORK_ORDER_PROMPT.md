# 13 — Next Work Order Prompt

## Will this help the final objective?
Yes — strengthens E2E reliability so the primary AI-based accreditation workflow can be improved without regressions.

## Next exact prompt

You are working on my AccrediOps / Accreditation Dashboard codebase.

Sprint title: **Core E2E Reliability Sprint (RBAC + Workflow Journeys)**

Objective:
Make Playwright a reliable regression gate for the primary accreditation workflow (framework → project → evidence → review/approval → export/print pack), plus the new AI documentation workflow.

Constraints:
- Do NOT implement notifications.
- Do NOT implement WebSockets.
- Do NOT do major redesigns.
- Prefer fixing product bugs over weakening tests.
- Prefer stable role-based selectors and `data-testid` only where needed.
- Keep AI outputs advisory-only; do not mutate evidence/status from AI generation.

Starting evidence (from previous sprint):
- Full run results: `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/phase10_playwright_full.txt` (52 passed, 27 failed, 1 flaky).
- Failure triage notes: `docs/_implementation/20260507_1110_core_workflow_ai_documentation_sprint/04_PLAYWRIGHT_FAILURE_TRIAGE.md`.

Work required:
1. Re-run `npx playwright test` and update `04_PLAYWRIGHT_FAILURE_TRIAGE.md` with the *current* failing set.
2. Fix failures in this priority order:
   - `tests/e2e/core-journeys.spec.ts` failures (evidence review, recurring, export, clone, overrides)
   - Role visibility / CTA gating specs
   - Admin surfaces reachability
   - Accessibility/skip link expectations
3. Stabilize seeds/state:
   - Update `frontend/tests/e2e/global-setup.cjs` and `backend/apps/projects/management/commands/seed_e2e_state.py` only as needed for determinism.
4. Add targeted assertions for AI Documentation E2E (keep it green).
5. Produce final evidence:
   - `05_PLAYWRIGHT_FINAL_RESULTS.md` updated with before/after
   - `11_FINAL_VERIFICATION_RESULTS.md` updated
   - GO/NO-GO verdict focused on E2E reliability

Final deliverable:
- Playwright failures reduced materially (target: <10 failures, 0 flaky) OR a clearly justified list of remaining true product bugs with reproducible evidence (trace paths).

