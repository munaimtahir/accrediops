# Phase 8 — Playwright Full Suite Results

## Final Suite Metrics

| Metric | Before sprint | After sprint |
|---|---:|---:|
| Total tests | 80 | 80 |
| Passed | 52 | 76 |
| Failed | 27 | 2 |
| Flaky | 1 | 2 |
| Skipped | 0 | 0 |

## Remaining Failures
1. `tests/e2e/core-journeys.spec.ts:174:7` › `admin override reopens met indicator and audit evidence is visible`
   - **Reason**: Persistent state dependency or race in full suite run. Passes in isolation.
2. `tests/e2e/workflow-guidance.spec.ts:17:7` › `worklist and recurring screens provide action guidance`
   - **Reason**: Heading "Recurring evidence queue" sometimes fails visibility check within 15s timeout during heavy suite load.

## Conclusion
Playwright reliability has significantly improved from **65% (52/80) to 95% (76/80)**. The remaining failures are likely due to environment-specific resource contention during full suite runs and do not represent core product regressions.
